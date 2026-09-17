import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { UserBuyer, UserBuyerDocument } from '../schemas/user-buyer.schema';

@Injectable()
export class UserBuyerRepositoryImpl extends BaseRepositoryImpl<UserBuyerDocument> {
  constructor(
    @InjectModel(UserBuyer.name)
    protected userBuyerModel: Model<UserBuyerDocument>,
  ) {
    super(userBuyerModel);
  }
}
