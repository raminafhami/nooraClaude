import { Module } from '@nestjs/common';
import { JobDescriptionService } from './job-description.service';
import { JobDescriptionController } from './job-description.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JobDescription,
  JobDescriptionSchema,
} from './schemas/job-description.schema';
import { JobDescriptionRepositoryImpl } from './repository/job-description.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobDescription.name, schema: JobDescriptionSchema },
    ]),
  ],
  controllers: [JobDescriptionController],
  providers: [JobDescriptionService, JobDescriptionRepositoryImpl],
  exports: [JobDescriptionService],
})
export class JobDescriptionModule {}
