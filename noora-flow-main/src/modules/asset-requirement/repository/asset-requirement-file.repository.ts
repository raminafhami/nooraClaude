import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  AssetRequirementFile,
  AssetRequirementFileDocument,
} from '../schemas/asset-requirement-file.schema';

@Injectable()
export class AssetRequirementFileRepositoryImpl extends BaseRepositoryImpl<AssetRequirementFileDocument> {
  constructor(
    @InjectModel(AssetRequirementFile.name)
    protected assetRequirementFileModel: Model<AssetRequirementFileDocument>,
  ) {
    super(assetRequirementFileModel);
  }
}
