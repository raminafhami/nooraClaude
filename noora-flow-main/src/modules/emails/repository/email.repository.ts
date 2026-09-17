import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Email, EmailDocument } from '../schemas/email.schema';
@Injectable()
export class EmailRepositoryImpl extends BaseRepositoryImpl<EmailDocument> {
  constructor(
    @InjectModel(Email.name)
    protected emailModel: Model<EmailDocument>,
  ) {
    super(emailModel);
  }
}
