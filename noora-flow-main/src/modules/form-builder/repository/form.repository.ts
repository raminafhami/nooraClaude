import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FormBuilderForm, FormDocument } from '../schemas/form.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormRepositoryImpl extends BaseRepositoryImpl<FormDocument> {
  constructor(
    @InjectModel(FormBuilderForm.name)
    private readonly formModel: Model<FormDocument>,
  ) {
    super(formModel);
  }
}
