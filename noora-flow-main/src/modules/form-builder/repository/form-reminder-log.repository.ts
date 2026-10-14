import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FormReminderLog,
  FormReminderLogDocument,
} from '../schemas/form-reminder-log.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormReminderLogRepositoryImpl extends BaseRepositoryImpl<FormReminderLogDocument> {
  constructor(
    @InjectModel(FormReminderLog.name)
    private readonly formReminderLogModel: Model<FormReminderLogDocument>,
  ) {
    super(formReminderLogModel);
  }
}
