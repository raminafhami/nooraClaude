import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  Put,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { AssetRequirementService } from './asset-requirement.service';
import {
  CreateAssetRequirementDto,
  UploadAssetFileDto,
} from './dto/create-asset-requirement.dto';
import {
  UpdateAssetRequirementChildrenDto,
  UpdateAssetRequirementDto,
} from './dto/update-asset-requirement.dto';
import { GetQueryDto } from 'src/shared/crud/dto/get-query.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AssetRequirementFileInterceptor } from './interceptors/asset-file.interceptor';
import * as fs from 'node:fs/promises';
import { Response } from 'express';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import { CheckPermissions } from '../iam/authentication/decorators/permissions.decorator';
import { ActiveUser } from '../iam/authentication/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/authentication/interfaces/active-user-data.interface';
import { AssetRequirementFileRepositoryImpl } from './repository/asset-requirement-file.repository';
import { title } from 'node:process';

@ApiTags('asset-requirement')
@ApiBearerAuth('token')
@Controller('asset-requirement')
export class AssetRequirementController {
  constructor(
    private readonly assetRequirementService: AssetRequirementService,
    private readonly assetRequirementFileRepositoryImpl: AssetRequirementFileRepositoryImpl,
  ) {}

  @CheckPermissions({
    action: PermissionAction.CREATE,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @Post()
  async create(@Body() createAssetRequirementDto: CreateAssetRequirementDto) {
    const assetReq = await this.assetRequirementService.createNewNode(
      createAssetRequirementDto,
    );

    return assetReq;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @Get()
  async findAll(
    @Query() queryDto: GetQueryDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    queryDto.populate = 'filesList';
    let result = [];
    const data = await this.assetRequirementService.findAll(queryDto);
    const filters = {};
    if (
      !activeUser.groups.includes('super-admin') &&
      !activeUser.groups.includes('qa-manager') &&
      !activeUser.groups.includes('ceo')
    ) {
      for (let assetReq of data.data) {
        filters['mimetype'] = 'application/pdf';
        filters['assetId'] = assetReq.id;
        const files = await this.assetRequirementService.findAssetFiles(
          filters,
        );
        result.push({
          ...JSON.parse(JSON.stringify(assetReq)),
          files: files.map((f) => {
            return { id: f.id, title: f.title };
          }),
        });
        data.data = result;
      }
    }

    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @Get(':auditId/tree')
  async getTree(@Param('auditId') auditId: string) {
    const data = await this.assetRequirementService.getTree(auditId);
    return data;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    const assetReq = await this.assetRequirementService.findById(id);
    if (!assetReq) {
      throw new NotFoundException('asset requirement not exist');
    }
    const filters = {};
    filters['assetId'] = assetReq.id;

    if (
      !activeUser.groups.includes('super-admin') &&
      !activeUser.groups.includes('qa-manager') &&
      !activeUser.groups.includes('ceo')
    ) {
      filters['mimetype'] = 'application/pdf';
    }
    const files = await this.assetRequirementService.findAssetFiles(filters);
    assetReq.files = files.map((f) => f.id);

    return assetReq;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAssetRequirementDto: UpdateAssetRequirementDto,
  ) {
    const newAssetReq = await this.assetRequirementService.findByIdAndUpdate(
      id,
      updateAssetRequirementDto,
    );
    if (!newAssetReq) {
      throw new NotFoundException('asset requirement not exist');
    }
    return newAssetReq;
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @Put(':id/change-order')
  async updateChildren(
    @Param('id') id: string,
    @Body()
    { children }: UpdateAssetRequirementChildrenDto,
  ) {
    const assetReq = await this.assetRequirementService.findById(id);
    if (!assetReq) {
      throw new NotFoundException('asset requirement not exist');
    }

    const checkChildren =
      Array.from(children)
        .sort((a, b) => a.localeCompare(b))
        .join('') ===
      assetReq.children
        .map((c) => c.toString())
        .sort((a, b) => a.localeCompare(b))
        .join('');
    if (!checkChildren) {
      throw new BadRequestException('can update order with this children');
    }

    const a = await this.assetRequirementService.updateById(id, {
      $set: {
        children,
      },
    });
    return a;
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const checkDeleted = await this.assetRequirementService.deleteNode(id);
    if (!checkDeleted) {
      throw new NotFoundException('asset requirement not exist.');
    }
  }

  @CheckPermissions({
    action: PermissionAction.UPDATE,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AssetRequirementFileInterceptor)
  @Post(':id/file')
  async addFileToAsset(
    @UploadedFile() file,
    @Body()
    uploadAssetFileDto: UploadAssetFileDto,
    @Param('id') id: string,
  ) {
    const asset = await this.assetRequirementService.findById(id);
    if (!asset) {
      await fs.unlink(file.path);
      throw new NotFoundException('asset requirement not exist.');
    }

    const assetFile = await this.assetRequirementService.saveFile({
      directory: file.destination,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
      title: uploadAssetFileDto.title,
      assetId: asset.id,
    });
    await this.assetRequirementService.updateById(asset.id, {
      $addToSet: {
        files: assetFile.id,
      },
    });
    return assetFile;
  }

  @CheckPermissions({
    action: PermissionAction.READ,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @Get(':fileId/show')
  async showFile(@Param('fileId') fileId: string, @Res() res: Response) {
    const file = await this.assetRequirementService.getFile(fileId);
    if (!file) throw new NotFoundException('asset file not found');
    return res.download(file.path);
  }

  @CheckPermissions({
    action: PermissionAction.DELETE,
    subject: Subjects.ASSET_REQUIREMENT,
  })
  @Delete('file/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    await this.assetRequirementService.deleteAssetFile(fileId);
  }
}
