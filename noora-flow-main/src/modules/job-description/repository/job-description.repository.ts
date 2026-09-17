import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  JobDescription,
  JobDescriptionDocument,
} from '../schemas/job-description.schema';

@Injectable()
export class JobDescriptionRepositoryImpl extends BaseRepositoryImpl<JobDescriptionDocument> {
  constructor(
    @InjectModel(JobDescription.name)
    protected JobDescriptionModel: Model<JobDescriptionDocument>,
  ) {
    super(JobDescriptionModel);
  }
}
