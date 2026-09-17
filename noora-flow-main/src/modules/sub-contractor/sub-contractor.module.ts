import { Module } from '@nestjs/common';
import { SubContractorService } from './sub-contractor.service';
import { SubContractorController } from './sub-contractor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SubContractor,
  SubContractorSchema,
} from './schema/sub-contractor.schema';
import { SubContractorRepositoryImpl } from './repository/sub-contractor.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubContractor.name, schema: SubContractorSchema },
    ]),
  ],
  controllers: [SubContractorController],
  providers: [SubContractorService, SubContractorRepositoryImpl],
})
export class SubContractorModule {}
