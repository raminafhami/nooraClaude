import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from '../schemas/permission.schema';
import { BaseRepositoryImpl } from 'src/shared/crud/repositories/base-repository.impl';

@Injectable()
export class PermissionsRepositoryImpl extends BaseRepositoryImpl<PermissionDocument> {
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<PermissionDocument>,
  ) {
    super(permissionModel);
  }
}
