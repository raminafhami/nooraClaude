import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepositoryImpl extends BaseRepositoryImpl<UserDocument> {
  constructor(
    @InjectModel(User.name)
    protected userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }
}
