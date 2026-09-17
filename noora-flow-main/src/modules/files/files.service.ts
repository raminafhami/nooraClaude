import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { File } from './schemas/files.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFileData } from './interfaces/file-data.interface';
import * as fs from 'fs';
import { InspectionFile } from './schemas/inspection-files.schema';
import { IInspectionFileData } from './interfaces/inspection-file-data.interface';
import { resolve } from 'path';
@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<File>,
    @InjectModel(InspectionFile.name)
    private inspectionFileModel: Model<InspectionFile>,
  ) {}

  async create(data: IFileData) {
    const file = await this.fileModel.create(data);
    return { id: file._id, name: file.filename, createdAt: file['createdAt'] };
  }

  async getFileAndCheckAccess(
    fileId: string,
    user: { id: string; userGroup: string },
  ) {
    const file = await this.fileModel.findOne({
      $and: [
        { _id: fileId },
        {
          $or: [
            { owner: user.id },
            { 'access.groups': user.userGroup },
            { 'access.users': user.id },
          ],
        },
      ],
    });
    if (!file) {
      throw new ForbiddenException()
    }
    return file;
  }

  async getFile(fileId: string) {
    const file = await this.fileModel.findById(fileId);
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async deleteFile(fileId: string) {
    const file = await this.getFile(fileId);
    fs.unlinkSync(file.path);
    await this.fileModel.deleteOne({ _id: fileId });
  }

  async getInstanceDocuments(processInstanceId: string, query: string) {
    let queryFilter = {} as any;
    if (query) {
      const fieldNames = query.split(',');
      queryFilter = {
        fieldNames: { $in: fieldNames },
      };
    }
    const files = await this.fileModel
      .find(
        {
          processInstanceId,
          ...queryFilter,
        },
        { filename: 1, createdAt: 1, fieldNames: 1, owner: 1, directory: 1 },
      )
      .populate({ path: 'owner', select: '_id name lastname' });
    return files.map((f) => ({
      id: f._id,
      filename: f.filename,
      fieldNames: f.fieldNames,
      owner: f.owner,
      createdAt: f['createdAt'],
      folder: f.directory.split('/').pop(),
    }));
  }

  async getInstanceDocumentsWithFilter(filter: any) {
    const files = await this.fileModel.find(
      {
        ...filter,
      },
      {
        filename: 1,
        fieldNames: 1,
        directory: 1,
        mimetype: 1,
        path: 1,
      },
    );
    return files;
  }

  async getInstanceImages(processInstanceId: string) {
    const images = await this.inspectionFileModel.find(
      {
        processInstanceId,
        mimetype: {
          $in: [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/heic',
            'image/jfif',
          ],
        },
      },
      { category: 1, path: 1 },
    );
    return images.map((i) => ({
      description: i.category.split(':')[0],
      path: resolve(i.path),
    }));
  }

  async createBatchFile(files: any) {
    return Promise.all(files.map((f) => this.create(f)));
  }

  async checkFieldsIsMultiple(instanceId: string, fieldNames: string[]) {
    const count = await this.fileModel.count({
      processInstanceId: instanceId,
      fieldNames: { $in: fieldNames },
    });
    return count >= 1 ? true : false;
  }

  async createInspectionFile(data: IInspectionFileData) {
    const file = await this.inspectionFileModel.create(data);
    return { id: file._id, name: file.filename, createdAt: file['createdAt'] };
  }
  async getInstanceInspectionFiles(processInstanceId: string) {
    return this.inspectionFileModel.find(
      {
        processInstanceId,
      },
      { filename: 1, description: 1, category: 1, createdAt: 1 ,processInstanceId: 1},
    );
  }

  async getInstanceFiles(processInstanceId: string) {
    return this.fileModel.find(
      {
        processInstanceId,
        path: { $regex: '/pic/'},
      },
      { filename: 1, createdAt: 1, processInstanceId: 1 },
    );
  }
  async getInspectionFile(fileId: string) {
    const file = await this.inspectionFileModel.findById(fileId);
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async deleteInspectionFile(fileId: string) {
    const file = await this.getInspectionFile(fileId);
    fs.unlinkSync(file.path);
    await this.inspectionFileModel.deleteOne({ _id: fileId });
  }

  async findAllFile(){
    return await this.inspectionFileModel.find({})
  }

  async updateFile(filter:any,update:any){
    return await this.inspectionFileModel.findOneAndUpdate(filter,update)
  }
}
