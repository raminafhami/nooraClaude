import { Module } from '@nestjs/common';
import { IndicatorService } from './indicator.service';
import { IndicatorController } from './indicator.controller';
import { IndicatorRepositoryImpl } from './repository/indicator.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Indicator, IndicatorSchema } from './schemas/indicator.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Indicator.name, schema: IndicatorSchema },
    ]),
  ],
  controllers: [IndicatorController],
  providers: [IndicatorService, IndicatorRepositoryImpl],
  exports: [IndicatorService],
})
export class IndicatorModule {}
