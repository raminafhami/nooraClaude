import { Module } from '@nestjs/common';
import { ExpertiseService } from './expertise.service';
import { ExpertiseController } from './expertise.controller';
import { ExpertiseRepositoryImpl } from './repository/expertise.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Expertise, ExpertiseSchema } from './schemas/expertise.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expertise.name, schema: ExpertiseSchema },
    ]),
  ],
  controllers: [ExpertiseController],
  providers: [ExpertiseService, ExpertiseRepositoryImpl],
})
export class ExpertiseModule {}
