import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Industry, IndustryDocument } from '../schemas/industry.schema';

@Injectable()
export class IndustryRepositoryImpl extends BaseRepositoryImpl<IndustryDocument> {
  constructor(
    @InjectModel(Industry.name)
    private readonly industryModel: Model<IndustryDocument>,
  ) {
    super(industryModel);
  }
}
