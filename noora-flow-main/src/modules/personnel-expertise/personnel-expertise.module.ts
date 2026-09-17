import { Module } from '@nestjs/common';
import { PersonnelExpertiseService } from './personnel-expertise.service';
import { PersonnelExpertiseController } from './personnel-expertise.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PersonnelExpertise,
  PersonnelExpertiseSchema,
} from './schemas/personnel-expertise.schema';
import { PersonnelExpertiseRepositoryImpl } from './repository/personnel-expertise.repository';
import {
  PersonnelCertificate,
  PersonnelCertificateSchema,
} from './schemas/personnel-certificate.schema';
import { PersonnelCertificateRepositoryImpl } from './repository/personnel-certificate.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PersonnelExpertise.name, schema: PersonnelExpertiseSchema },
      { name: PersonnelCertificate.name, schema: PersonnelCertificateSchema },
    ]),
  ],
  controllers: [PersonnelExpertiseController],
  providers: [
    PersonnelExpertiseService,
    PersonnelExpertiseRepositoryImpl,
    PersonnelCertificateRepositoryImpl,
  ],
  exports: [PersonnelExpertiseService],
})
export class PersonnelExpertiseModule {}
