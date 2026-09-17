import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PettyCostModule } from '../petty-costs/petty-cost.module';
import { CategoryModule } from '../categories/category.module';
import {
  CategoryBudget,
  categoryBudgetSchema,
} from './schemas/category-budget.schema';
import { CategoryBudgetController } from './category-budget.controller';
import { CategoryBudgetService } from './category-budget.service';
import { CategoryBudgetRepositoryImpl } from './repositories/category-budget.repository';
import { InspectionCostsModule } from '../inspection-costs/inspection-costs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CategoryBudget.name,
        schema: categoryBudgetSchema,
      },
    ]),
    forwardRef(() => PettyCostModule),
    forwardRef(() => CategoryModule),
    forwardRef(() => InspectionCostsModule),
  ],
  controllers: [CategoryBudgetController],
  providers: [CategoryBudgetService, CategoryBudgetRepositoryImpl],
  exports: [CategoryBudgetService],
})
export class CategoryBudgetModule {}
