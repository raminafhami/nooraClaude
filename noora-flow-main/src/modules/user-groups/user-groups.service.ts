import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { UserGroupDocument } from './schemas/user-group.schema';
import { UserGroupRepositoryImpl } from './repository/user-group.repository';

@Injectable()
export class UserGroupsService extends CrudService<UserGroupDocument> {
  constructor(
    private readonly userGroupRepositoryImpl: UserGroupRepositoryImpl,
  ) {
    super(userGroupRepositoryImpl);
  }
}
