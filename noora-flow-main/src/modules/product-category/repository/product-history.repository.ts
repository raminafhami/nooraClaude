import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  ProductCategory,
  ProductCategoryDocument,
} from '../schemas/product-category.schema';

@Injectable()
export class ProductCategoryRepositoryImpl extends BaseRepositoryImpl<ProductCategoryDocument> {
  constructor(
    @InjectModel(ProductCategory.name)
    protected productCategoryModel: Model<ProductCategoryDocument>,
  ) {
    super(productCategoryModel);
  }
}
