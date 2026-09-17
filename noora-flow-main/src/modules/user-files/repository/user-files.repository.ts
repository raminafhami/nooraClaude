import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { UserFile, UserFileDocument } from '../schemas/user-file.schema';

@Injectable()
export class UserFileRepositoryImpl extends BaseRepositoryImpl<UserFileDocument> {
  constructor(
    @InjectModel(UserFile.name)
    protected userFileModel: Model<UserFileDocument>,
  ) {
    super(userFileModel);
  }
}
