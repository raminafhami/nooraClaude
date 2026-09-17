import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Submission, SubmissionDocument } from '../schemas/submission.schema';

@Injectable()
export class SubmissionsRepositoryImpl extends BaseRepositoryImpl<SubmissionDocument> {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<SubmissionDocument>,
  ) {
    super(submissionModel);
  }
}
