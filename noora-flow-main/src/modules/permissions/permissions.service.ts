import { Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { PermissionDocument } from './schemas/permission.schema';
import { PermissionsRepositoryImpl } from './repository/permissions.repository';

@Injectable()
export class PermissionsService extends CrudService<PermissionDocument> {
  constructor(private permissionsRepositoryImpl: PermissionsRepositoryImpl) {
    super(permissionsRepositoryImpl);
  }
}
