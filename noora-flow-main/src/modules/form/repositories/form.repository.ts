import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Form, FormDocument } from '../schemas/form.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormsRepositoryImpl extends BaseRepositoryImpl<FormDocument> {
  constructor(
    @InjectModel(Form.name)
    private readonly formModel: Model<FormDocument>,
  ) {
    super(formModel);
  }
}
