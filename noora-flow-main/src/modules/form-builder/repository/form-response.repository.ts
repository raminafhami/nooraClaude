import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FormResponse,
  FormResponseDocument,
} from '../schemas/form-response.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormResponseRepositoryImpl extends BaseRepositoryImpl<FormResponseDocument> {
  constructor(
    @InjectModel(FormResponse.name)
    private readonly formResponseModel: Model<FormResponseDocument>,
  ) {
    super(formResponseModel);
  }
}
