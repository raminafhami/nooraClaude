import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Buyer, BuyerDocument } from '../schemas/buyer.schema';

@Injectable()
export class BuyerRepositoryImpl extends BaseRepositoryImpl<BuyerDocument> {
  constructor(
    @InjectModel(Buyer.name)
    protected buyerModel: Model<BuyerDocument>,
  ) {
    super(buyerModel);
  }
}
