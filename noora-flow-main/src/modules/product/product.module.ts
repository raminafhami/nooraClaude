import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductHistoryService } from './product-history.service';
import { ProductRepositoryImpl } from './repository/product.repository';
import { ProductHistoryRepositoryImpl } from './repository/product-history.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import {
  ProductHistory,
  ProductHistorySchema,
} from './schemas/product-history.schema';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductHistory.name, schema: ProductHistorySchema },
    ]),
    QueueModule
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductHistoryService,
    ProductRepositoryImpl,
    ProductHistoryRepositoryImpl,
  ],
})
export class ProductModule {}
