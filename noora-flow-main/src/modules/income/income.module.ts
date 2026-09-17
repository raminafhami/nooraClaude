import { forwardRef, Module } from '@nestjs/common';
import { IncomeController } from './income.controller';
import { IncomeRepository } from './repository/income.repository';
import { IncomeService } from './income.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Income, IncomeSchema } from './schemas/income.schema';
import { ProcessInstancesModule } from '../process-instances/process-instances.module';
import { InspectionCostsModule } from '../inspection-costs/inspection-costs.module';
import { CurrencyRateModule } from 'src/common/providers/external/currency-rate/currency-rate.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { CategoryModule } from '../categories/category.module';

@Module({
  imports: [
    forwardRef(() => ProcessInstancesModule),
    forwardRef(() => InspectionCostsModule),
    forwardRef(() => InvoiceModule),
    CategoryModule,
    CurrencyRateModule,
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
  ],
  controllers: [IncomeController],
  providers: [IncomeRepository, IncomeService],
  exports: [IncomeService],
})
export class IncomeModule {}
