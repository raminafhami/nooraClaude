import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  PropertyFileDocument,
  PropertyFile,
} from '../schema/property-file.schema';

@Injectable()
export class PropertyFileRepositoryImpl extends BaseRepositoryImpl<PropertyFileDocument> {
  constructor(
    @InjectModel(PropertyFile.name)
    protected propertyFileModel: Model<PropertyFileDocument>,
  ) {
    super(propertyFileModel);
  }
}
