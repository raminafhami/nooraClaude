import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { PettyCash, PettyCashDocument } from '../schemas/petty-cash.schema';

@Injectable()
export class PettyCashRepositoryImpl extends BaseRepositoryImpl<PettyCashDocument> {
  constructor(
    @InjectModel(PettyCash.name)
    protected pettyCashModel: Model<PettyCashDocument>,
  ) {
    super(pettyCashModel);
  }
}
