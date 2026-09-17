import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  CompanyFile,
  CompanyFileDocument,
} from '../schemas/company-file.schema';

@Injectable()
export class CompanyFileRepositoryImpl extends BaseRepositoryImpl<CompanyFileDocument> {
  constructor(
    @InjectModel(CompanyFile.name)
    protected userFileModel: Model<CompanyFileDocument>,
  ) {
    super(userFileModel);
  }
}
