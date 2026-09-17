import { Injectable } from '@nestjs/common';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Income, IncomeDocument } from '../schemas/income.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IncomeSchema } from '../schemas/income.schema';

@Injectable()
export class IncomeRepository extends BaseRepositoryImpl<IncomeDocument> {
  constructor(
    @InjectModel(Income.name)
    protected incomeModel: Model<IncomeDocument>,
  ) {
    super(incomeModel);
  }
}
