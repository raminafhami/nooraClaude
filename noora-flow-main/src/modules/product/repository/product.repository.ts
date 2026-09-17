import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Product, ProductDocument } from '../schemas/product.schema';

@Injectable()
export class ProductRepositoryImpl extends BaseRepositoryImpl<ProductDocument> {
  constructor(
    @InjectModel(Product.name)
    protected productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }
}
