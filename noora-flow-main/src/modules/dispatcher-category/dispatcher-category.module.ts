import { Module } from '@nestjs/common';
import { DispatcherCategoryService } from './dispatcher-category.service';
import { DispatcherCategoryController } from './dispatcher-category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DispatcherCategory,
  DispatcherCategorySchema,
} from './schemas/dispatcher-category.schema';
import { DispatcherCategoryRepositoryImpl } from './repository/dispatcher-category.repository';
import { AppConfigModule } from 'src/config/app/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DispatcherCategory.name, schema: DispatcherCategorySchema },
    ]),
    AppConfigModule,
  ],
  controllers: [DispatcherCategoryController],
  providers: [DispatcherCategoryService, DispatcherCategoryRepositoryImpl],
})
export class DispatcherCategoryModule {}
