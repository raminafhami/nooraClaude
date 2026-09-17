import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  SubContractor,
  SubContractorDocument,
} from '../schema/sub-contractor.schema';

@Injectable()
export class SubContractorRepositoryImpl extends BaseRepositoryImpl<SubContractorDocument> {
  constructor(
    @InjectModel(SubContractor.name)
    protected subContractorModel: Model<SubContractorDocument>,
  ) {
    super(subContractorModel);
  }
}
