import { forwardRef, Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceRepository } from './repository/invoice.repository';
import { InvoiceService } from './invoice.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Income } from '../income/schemas/income.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { IncomeModule } from '../income/income.module';
import { ProcessInstancesModule } from '../process-instances/process-instances.module';
import { UsersModule } from '../users/users.module';
import { IndicatorModule } from '../indicator/indicator.module';
import { PersonnelModule } from '../personnel/personnel.module';
import { FinancialModule } from '../financial/financial.module';
import { CronJobService } from 'src/common/providers/cron-job.service';
import { QueueModule } from '../queue/queue.module';
import { AppConfigModule } from 'src/config/app/config.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => IncomeModule),
    forwardRef(() => ProcessInstancesModule),
    PersonnelModule,
    IndicatorModule,
    FinancialModule,
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    QueueModule,
    AppConfigModule,
    SmsModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceRepository, InvoiceService, CronJobService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
