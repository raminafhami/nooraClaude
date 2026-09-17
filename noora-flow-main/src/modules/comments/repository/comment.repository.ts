import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';
import { Comments, CommentsDocument } from '../schemas/comment.schema';

@Injectable()
export class CommentsRepositoryImpl extends BaseRepositoryImpl<CommentsDocument> {
  constructor(
    @InjectModel(Comments.name)
    protected commentsModel: Model<CommentsDocument>,
  ) {
    super(commentsModel);
  }
}
