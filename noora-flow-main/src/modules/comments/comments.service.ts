import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { CommentsDocument } from './schemas/comment.schema';
import { CommentsRepositoryImpl } from './repository/comment.repository';

@Injectable()
export class CommentsService extends CrudService<CommentsDocument> {
  constructor(commentsRepositoryImpl: CommentsRepositoryImpl) {
    super(commentsRepositoryImpl);
  }
}
