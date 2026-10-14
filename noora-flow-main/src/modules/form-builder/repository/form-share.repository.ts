import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FormShare, FormShareDocument } from '../schemas/form-share.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormShareRepositoryImpl extends BaseRepositoryImpl<FormShareDocument> {
  constructor(
    @InjectModel(FormShare.name)
    private readonly formShareModel: Model<FormShareDocument>,
  ) {
    super(formShareModel);
  }
}
