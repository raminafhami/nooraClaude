import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { UserGroup, UserGroupDocument } from '../schemas/user-group.schema';

@Injectable()
export class UserGroupRepositoryImpl extends BaseRepositoryImpl<UserGroupDocument> {
  constructor(
    @InjectModel(UserGroup.name)
    protected userGroupModel: Model<UserGroupDocument>,
  ) {
    super(userGroupModel);
  }
}
