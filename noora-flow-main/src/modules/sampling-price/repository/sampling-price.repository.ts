import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  SamplingPrice,
  SamplingPriceDocument,
} from '../schemas/sampling-price.schema';

@Injectable()
export class SamplingPriceRepositoryImpl extends BaseRepositoryImpl<SamplingPriceDocument> {
  constructor(
    @InjectModel(SamplingPrice.name)
    protected samplingPriceModel: Model<SamplingPriceDocument>,
  ) {
    super(samplingPriceModel);
  }
}
