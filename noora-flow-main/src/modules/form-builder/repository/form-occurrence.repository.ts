import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FormOccurrence,
  FormOccurrenceDocument,
} from '../schemas/form-occurrence.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormOccurrenceRepositoryImpl extends BaseRepositoryImpl<FormOccurrenceDocument> {
  constructor(
    @InjectModel(FormOccurrence.name)
    private readonly formOccurrenceModel: Model<FormOccurrenceDocument>,
  ) {
    super(formOccurrenceModel);
  }
}
