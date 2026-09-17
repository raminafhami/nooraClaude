import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  PersonnelExpertise,
  PersonnelExpertiseDocument,
} from '../schemas/personnel-expertise.schema';
import {
  PersonnelCertificate,
  PersonnelCertificateDocument,
} from '../schemas/personnel-certificate.schema';

@Injectable()
export class PersonnelCertificateRepositoryImpl extends BaseRepositoryImpl<PersonnelCertificateDocument> {
  constructor(
    @InjectModel(PersonnelCertificate.name)
    protected personnelCertificateModel: Model<PersonnelCertificateDocument>,
  ) {
    super(personnelCertificateModel);
  }
}
