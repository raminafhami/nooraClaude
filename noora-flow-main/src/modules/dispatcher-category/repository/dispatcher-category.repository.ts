import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  DispatcherCategory,
  DispatcherCategoryDocument,
} from '../schemas/dispatcher-category.schema';

@Injectable()
export class DispatcherCategoryRepositoryImpl extends BaseRepositoryImpl<DispatcherCategoryDocument> {
  constructor(
    @InjectModel(DispatcherCategory.name)
    protected dispatcherCategoryDocumentModel: Model<DispatcherCategoryDocument>,
  ) {
    super(dispatcherCategoryDocumentModel);
  }
}
