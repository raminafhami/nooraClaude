import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PettyCash, PettyCashSchema } from './schemas/petty-cash.schema';
import { PettyCashController } from './petty-cash.controller';
import { PettyCashService } from './petty-cash.service';
import { PettyCashRepositoryImpl } from './repositories/petty-cash.repository';
import { PettyCostModule } from '../petty-costs/petty-cost.module';
import { CategoryModule } from '../categories/category.module';
import { CategoryBudgetModule } from '../category-budget/category-budget.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PettyCash.name,
        schema: PettyCashSchema,
      },
    ]),
    forwardRef(() => PettyCostModule),
    forwardRef(() =>CategoryModule),
    forwardRef(() => CategoryBudgetModule),
  ],
  controllers: [PettyCashController],
  providers: [PettyCashService, PettyCashRepositoryImpl],
  exports: [PettyCashService],
})
export class PettyCashModule {}
