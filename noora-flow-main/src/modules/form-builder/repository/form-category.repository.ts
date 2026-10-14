import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FormCategory,
  FormCategoryDocument,
} from '../schemas/form-category.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormCategoryRepositoryImpl extends BaseRepositoryImpl<FormCategoryDocument> {
  constructor(
    @InjectModel(FormCategory.name)
    private readonly formCategoryModel: Model<FormCategoryDocument>,
  ) {
    super(formCategoryModel);
  }
}
