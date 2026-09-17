import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { ProductDocument } from './schemas/product.schema';
import { ProductRepositoryImpl } from './repository/product.repository';

@Injectable()
export class ProductService extends CrudService<ProductDocument> {
  constructor(productRepositoryImpl: ProductRepositoryImpl) {
    super(productRepositoryImpl);
  }
}
