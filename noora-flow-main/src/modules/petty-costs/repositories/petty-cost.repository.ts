import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { PettyCost, PettyCostDocument } from '../schemas/petty-cost.schema';

@Injectable()
export class PettyCostRepositoryImpl extends BaseRepositoryImpl<PettyCostDocument> {
  constructor(
    @InjectModel(PettyCost.name)
    protected pettyCostModel: Model<PettyCostDocument>,
  ) {
    super(pettyCostModel);
  }
}
