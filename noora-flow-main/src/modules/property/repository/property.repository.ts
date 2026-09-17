import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Property, PropertyDocument } from '../schema/property.schema';

@Injectable()
export class PropertyRepositoryImpl extends BaseRepositoryImpl<PropertyDocument> {
  constructor(
    @InjectModel(Property.name)
    protected propertyModel: Model<PropertyDocument>,
  ) {
    super(propertyModel);
  }
}
