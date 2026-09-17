import { forwardRef, Module } from '@nestjs/common';
import { InspectionCostsService } from './inspection-costs.service';
import { InspectionCostsController } from './inspection-costs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { InspectionCostRepositoryImpl } from './repository/inspection-cost.repository';
import {
  InspectionCost,
  InspectionCostSchema,
} from './schemas/inspection-cost.schema';
import { ProcessInstancesModule } from '../process-instances/process-instances.module';
import { CategoryModule } from '../categories/category.module';
import { CurrencyRateModule } from 'src/common/providers/external/currency-rate/currency-rate.module';
import { IncomeModule } from '../income/income.module';
import { CategoryBudgetModule } from '../category-budget/category-budget.module';

@Module({
  imports: [
    CurrencyRateModule,
    forwardRef(() => ProcessInstancesModule),
    forwardRef(() => IncomeModule),
    MongooseModule.forFeature([
      { name: InspectionCost.name, schema: InspectionCostSchema },
    ]),
    forwardRef(() =>CategoryModule),
    forwardRef(() => CategoryBudgetModule),
  ],
  controllers: [InspectionCostsController],
  providers: [InspectionCostsService, InspectionCostRepositoryImpl],
  exports: [InspectionCostsService],
})
export class InspectionCostsModule {}
