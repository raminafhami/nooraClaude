import { Module } from '@nestjs/common';
import { ContractNumberService } from './contract-number.service';
import { ContractNumberController } from './contract-number.controller';
import {
  ContractNumber,
  ContractNumberSchema,
} from './schemas/contract-number.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractNumberRepositoryImpl } from './repository/contract-number.repository';
import { IndicatorModule } from '../indicator/indicator.module';
import { BuyerCode, BuyerCodeSchema } from './schemas/buyer-code.schema';
import { BuyerCodeRepositoryImpl } from './repository/buyer-code.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContractNumber.name, schema: ContractNumberSchema },
      { name: BuyerCode.name, schema: BuyerCodeSchema },
    ]),
    IndicatorModule,
  ],
  controllers: [ContractNumberController],
  providers: [
    ContractNumberService,
    ContractNumberRepositoryImpl,
    BuyerCodeRepositoryImpl,
  ],
  exports: [ContractNumberService],
})
export class ContractNumberModule {}
