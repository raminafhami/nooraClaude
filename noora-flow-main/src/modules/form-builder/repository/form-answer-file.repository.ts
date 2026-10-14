import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FormAnswerFile,
  FormAnswerFileDocument,
} from '../schemas/form-answer-file.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormAnswerFileRepositoryImpl extends BaseRepositoryImpl<FormAnswerFileDocument> {
  constructor(
    @InjectModel(FormAnswerFile.name)
    private readonly formAnswerFileModel: Model<FormAnswerFileDocument>,
  ) {
    super(formAnswerFileModel);
  }
}
