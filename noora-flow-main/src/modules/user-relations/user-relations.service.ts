import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { UserRelationsDocument } from './schemas/user-relation.schema';
import { UserRelationsRepositoryImpl } from './repository/user-relation.repository';

@Injectable()
export class UserRelationsService extends CrudService<UserRelationsDocument> {
  constructor(userRelationsRepositoryImpl: UserRelationsRepositoryImpl) {
    super(userRelationsRepositoryImpl);
  }
}
