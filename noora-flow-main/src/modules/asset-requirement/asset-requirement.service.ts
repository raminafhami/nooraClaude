import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { AssetRequirementDocument } from './schemas/asset-requirement.schema';
import { AssetRequirementRepositoryImpl } from './repository/asset-requirement.repository';
import { CreateAssetRequirementDto } from './dto/create-asset-requirement.dto';
import { AssetRequirementFileRepositoryImpl } from './repository/asset-requirement-file.repository';
import * as fs from 'node:fs/promises';

@Injectable()
export class AssetRequirementService
  extends CrudService<AssetRequirementDocument>
  implements OnModuleInit
{
  constructor(
    private assetRequirementRepositoryImpl: AssetRequirementRepositoryImpl,
    private assetRequirementFileRepositoryImpl: AssetRequirementFileRepositoryImpl,
  ) {
    super(assetRequirementRepositoryImpl);
  }
  async onModuleInit() {
    // await this.assetRequirementRepositoryImpl.model.updateOne(
    //   {
    //     parent: null,
    //   },
    //   {
    //     $set: {
    //       parent: null,
    //       paraNumber: '',
    //       questionDescription: 'ROOT',
    //     },
    //   },
    //   { upsert: true },
    // );
  }

  async createNewNode(createAssetRequirementDto: CreateAssetRequirementDto) {
    const parentNode = await this.assetRequirementRepositoryImpl.findOne({
      _id: createAssetRequirementDto.parent,
      auditId: createAssetRequirementDto.auditId,
    });

    if (!parentNode)
      throw new BadRequestException('parent not found or not for this audit');

    const assetReq = await this.assetRequirementRepositoryImpl.create({
      auditId: createAssetRequirementDto.auditId,
      parent: parentNode.id,
      ancestors: parentNode.ancestors.concat(parentNode.id) || [parentNode.id],
      questionDescription: createAssetRequirementDto.questionDescription,
      paraNumber: createAssetRequirementDto.paraNumber
        ? createAssetRequirementDto.paraNumber
        : `${parentNode.paraNumber}-${parentNode.children.length + 1}`,
    });
    await this.assetRequirementRepositoryImpl.updateOne(
      { _id: parentNode.id },
      { $push: { children: assetReq.id } },
    );
    return assetReq;
  }
  async getTree(auditId: string) {
    const nodes = await this.assetRequirementRepositoryImpl.model
      .find({ auditId })
      .populate('filesList')
      .select('-ancestors');

    const [parentNode] = nodes.filter((n) => n.parent == null);
    const nodesObj = nodes
      .map((n) => n.toObject())
      .reduce((acc, cur) => {
        return {
          ...acc,
          [cur.id]: {
            id: cur.id,
            paraNumber: cur.paraNumber,
            questionDescription: cur.questionDescription,
            children: cur.children,
            files: cur.files,
          },
        };
      }, {});

    const makeTree = (id: string) => {
      return Object.assign(nodesObj[id], {
        children: nodesObj[id].children.map(makeTree),
      });
    };
    return makeTree(parentNode.toObject().id);
  }

  async deleteNode(id: string) {
    const node = await this.assetRequirementRepositoryImpl.findOne({
      _id: id,
      children: { $size: 0 },
      parent: { $ne: null },
    });
    if (!node) {
      throw new BadRequestException('cant delete asset requirement');
    }

    await this.assetRequirementRepositoryImpl.updateById(node.parent, {
      $pull: { children: node.id },
    });

    // find one file and delete dir
    const file = await this.assetRequirementFileRepositoryImpl.findOne({
      assetId: id,
    });
    if (file) {
      await this.assetRequirementFileRepositoryImpl.model.deleteMany({
        assetId: id,
      });
      await fs.rm(file.directory, { recursive: true, force: true });
    }
    return this.assetRequirementRepositoryImpl.deleteById(node.id);
  }

  async saveFile(data: any) {
    return this.assetRequirementFileRepositoryImpl.create(data);
  }

  async getFile(fileId: string) {
    return this.assetRequirementFileRepositoryImpl.findById(fileId);
  }

  async deleteAssetFile(fileId: string) {
    const file = await this.getFile(fileId);
    await this.assetRequirementFileRepositoryImpl.deleteById(fileId);
    await fs.unlink(file.path);
  }

  async findAssetFiles(filters: any) {
    return await this.assetRequirementFileRepositoryImpl.findWithOutPagination(
      filters,
    );
  }
}
