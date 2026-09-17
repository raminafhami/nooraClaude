import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRepositoryImpl } from './repositories/payment.repository';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { BankGatewayConfigModule } from 'src/config/bank-gateway/config.module';
import { ProcessInstancesModule } from '../process-instances/process-instances.module';
import { ProcessDefinitionsModule } from '../process-definitions/process-definitions.module';
import { UsersModule } from '../users/users.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { IncomeModule } from '../income/income.module';
import { AppConfigModule } from 'src/config/app/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    HttpModule,
    BankGatewayConfigModule,
    ProcessInstancesModule,
    ProcessDefinitionsModule,
    UsersModule,
    InvoiceModule,
    IncomeModule,
    AppConfigModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepositoryImpl],
})
export class PaymentModule {}
