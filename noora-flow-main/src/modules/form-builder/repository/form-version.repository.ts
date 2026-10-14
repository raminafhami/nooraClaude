import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FormVersion,
  FormVersionDocument,
} from '../schemas/form-version.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormVersionRepositoryImpl extends BaseRepositoryImpl<FormVersionDocument> {
  constructor(
    @InjectModel(FormVersion.name)
    private readonly formVersionModel: Model<FormVersionDocument>,
  ) {
    super(formVersionModel);
  }
}
