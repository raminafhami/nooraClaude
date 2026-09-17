import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  ProductHistory,
  ProductHistoryDocument,
} from '../schemas/product-history.schema';

@Injectable()
export class ProductHistoryRepositoryImpl extends BaseRepositoryImpl<ProductHistoryDocument> {
  constructor(
    @InjectModel(ProductHistory.name)
    protected productHistoryModel: Model<ProductHistoryDocument>,
  ) {
    super(productHistoryModel);
  }
}
