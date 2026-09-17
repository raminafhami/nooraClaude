import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { BuyerCode, BuyerCodeDocument } from '../schemas/buyer-code.schema';

@Injectable()
export class BuyerCodeRepositoryImpl extends BaseRepositoryImpl<BuyerCodeDocument> {
  constructor(
    @InjectModel(BuyerCode.name)
    protected buyerCodeModel: Model<BuyerCodeDocument>,
  ) {
    super(buyerCodeModel);
  }
}
