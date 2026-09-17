import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Industry, IndustrySchema } from './schemas/industry.schema';
import { IndustryService } from './industry.service';
import { IndustryController } from './industry.controller';
import { IndustryRepositoryImpl } from './repository/industry.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Industry.name,
        schema: IndustrySchema,
      },
    ]),
  ],
  providers: [IndustryService, IndustryRepositoryImpl],
  controllers: [IndustryController],
  exports:[IndustryService]
})
export class IndustryModule {}
