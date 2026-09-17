import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Expertise, ExpertiseDocument } from '../schemas/expertise.schema';

@Injectable()
export class ExpertiseRepositoryImpl extends BaseRepositoryImpl<ExpertiseDocument> {
  constructor(
    @InjectModel(Expertise.name)
    protected expertiseModel: Model<ExpertiseDocument>,
  ) {
    super(expertiseModel);
  }
}
