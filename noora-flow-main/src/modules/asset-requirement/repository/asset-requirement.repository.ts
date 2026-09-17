import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  AssetRequirement,
  AssetRequirementDocument,
} from '../schemas/asset-requirement.schema';

@Injectable()
export class AssetRequirementRepositoryImpl extends BaseRepositoryImpl<AssetRequirementDocument> {
  constructor(
    @InjectModel(AssetRequirement.name)
    protected assetRequirementModel: Model<AssetRequirementDocument>,
  ) {
    super(assetRequirementModel);
  }
}
