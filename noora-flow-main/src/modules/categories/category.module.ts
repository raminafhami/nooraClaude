import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './entity/category.schema';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepositoryImpl } from './repository/category.repository.dto';
import { CategoryBudgetModule } from '../category-budget/category-budget.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    forwardRef(() => CategoryBudgetModule),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepositoryImpl],
  exports: [CategoryService],
})
export class CategoryModule {}
