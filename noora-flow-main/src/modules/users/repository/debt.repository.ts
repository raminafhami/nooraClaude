import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Debt, DebtDocument } from '../schemas/debt.schema';

@Injectable()
export class DebtRepositoryImpl extends BaseRepositoryImpl<DebtDocument> {
  constructor(
    @InjectModel(Debt.name)
    protected debtModel: Model<DebtDocument>,
  ) {
    super(debtModel);
  }
}
