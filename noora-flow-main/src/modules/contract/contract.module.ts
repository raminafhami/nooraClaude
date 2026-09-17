import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { ContractRepositoryImpl } from './repository/contract.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Contract, ContractSchema } from './schemas/contract.schema';
import { PersonnelModule } from '../personnel/personnel.module';
import { UsersModule } from '../users/users.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
    ]),
    PersonnelModule,
  ],
  controllers: [ContractController],
  providers: [ContractService, ContractRepositoryImpl],
})
export class ContractModule {}
