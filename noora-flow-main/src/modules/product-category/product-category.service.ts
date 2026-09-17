import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { ProductCategoryDocument } from './schemas/product-category.schema';
import { ProductCategoryRepositoryImpl } from './repository/product-history.repository';

@Injectable()
export class ProductCategoryService extends CrudService<ProductCategoryDocument> {
  constructor(productCategoryRepositoryImpl: ProductCategoryRepositoryImpl) {
    super(productCategoryRepositoryImpl);
  }
}
