import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Indicator, IndicatorDocument } from '../schemas/indicator.schema';

@Injectable()
export class IndicatorRepositoryImpl extends BaseRepositoryImpl<IndicatorDocument> {
  constructor(
    @InjectModel(Indicator.name)
    protected indicatorModel: Model<IndicatorDocument>,
  ) {
    super(indicatorModel);
  }
}
