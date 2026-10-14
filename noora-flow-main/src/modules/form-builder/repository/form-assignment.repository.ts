import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FormAssignment,
  FormAssignmentDocument,
} from '../schemas/form-assignment.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class FormAssignmentRepositoryImpl extends BaseRepositoryImpl<FormAssignmentDocument> {
  constructor(
    @InjectModel(FormAssignment.name)
    private readonly formAssignmentModel: Model<FormAssignmentDocument>,
  ) {
    super(formAssignmentModel);
  }
}
