import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import {
  UserRelations,
  UserRelationsDocument,
} from '../schemas/user-relation.schema';

@Injectable()
export class UserRelationsRepositoryImpl extends BaseRepositoryImpl<UserRelationsDocument> {
  constructor(
    @InjectModel(UserRelations.name)
    protected userRelationsModel: Model<UserRelationsDocument>,
  ) {
    super(userRelationsModel);
  }
}
