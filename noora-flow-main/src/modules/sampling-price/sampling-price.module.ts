import { Module } from '@nestjs/common';
import { SamplingPriceService } from './sampling-price.service';
import { SamplingPriceController } from './sampling-price.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SamplingPrice,
  SamplingPriceSchema,
} from './schemas/sampling-price.schema';
import { SamplingPriceRepositoryImpl } from './repository/sampling-price.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SamplingPrice.name, schema: SamplingPriceSchema },
    ]),
  ],
  controllers: [SamplingPriceController],
  providers: [SamplingPriceService, SamplingPriceRepositoryImpl],
})
export class SamplingPriceModule {}
