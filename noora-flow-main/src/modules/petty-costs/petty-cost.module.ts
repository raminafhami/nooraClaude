import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PettyCost, PettyCostSchema } from './schemas/petty-cost.schema';
import { PettyCostController } from './petty-cost.controller';
import { PettyCostService } from './petty-cost.service';
import { PettyCostRepositoryImpl } from './repositories/petty-cost.repository';
import { PettyCashModule } from '../petty-cash/petty-cash.module';
import { CategoryBudgetModule } from '../category-budget/category-budget.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PettyCost.name,
        schema: PettyCostSchema,
      },
    ]),
    forwardRef(() => PettyCashModule),
    forwardRef(() => CategoryBudgetModule),
  ],
  controllers: [PettyCostController],
  providers: [PettyCostService, PettyCostRepositoryImpl],
  exports: [PettyCostService],
})
export class PettyCostModule {}
