import { Module } from '@nestjs/common';
import { JobDescriptionService } from './job-description.service';
import { JobDescriptionController } from './job-description.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JobDescription,
  JobDescriptionSchema,
} from './schemas/job-description.schema';
import { JobDescriptionRepositoryImpl } from './repository/job-description.repository';
import { JobExpertiseSyncService } from './job-expertise-sync.service';
import {
  Personnel,
  PersonnelSchema,
} from '../personnel/schemas/personnel.schema';
import {
  PersonnelExpertise,
  PersonnelExpertiseSchema,
} from '../personnel-expertise/schemas/personnel-expertise.schema';
import {
  PersonnelCertificate,
  PersonnelCertificateSchema,
} from '../personnel-expertise/schemas/personnel-certificate.schema';
import {
  Expertise,
  ExpertiseSchema,
} from '../expertise/schemas/expertise.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JobDescription.name, schema: JobDescriptionSchema },
      // Models only (no module import) so personnel <-> job-description
      // stays free of a circular module dependency.
      { name: Personnel.name, schema: PersonnelSchema },
      { name: PersonnelExpertise.name, schema: PersonnelExpertiseSchema },
      { name: PersonnelCertificate.name, schema: PersonnelCertificateSchema },
      { name: Expertise.name, schema: ExpertiseSchema },
    ]),
  ],
  controllers: [JobDescriptionController],
  providers: [
    JobDescriptionService,
    JobDescriptionRepositoryImpl,
    JobExpertiseSyncService,
  ],
  exports: [JobDescriptionService, JobExpertiseSyncService],
})
export class JobDescriptionModule {}
