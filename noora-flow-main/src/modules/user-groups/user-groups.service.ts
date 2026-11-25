import { BadRequestException, Injectable } from '@nestjs/common';
import { CrudService } from 'src/shared/crud/service/crud.service';
import { UserGroupDocument } from './schemas/user-group.schema';
import { UserGroupRepositoryImpl } from './repository/user-group.repository';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateUserGroupDto } from './dto/create-user-group.dto';
import { UpdateUserGroupDto } from './dto/update-user-group.dto';

@Injectable()
export class UserGroupsService extends CrudService<UserGroupDocument> {
  constructor(
    userGroupRepositoryImpl: UserGroupRepositoryImpl,
    private readonly permissionsService: PermissionsService,
  ) {
    super(userGroupRepositoryImpl);
  }

  async createGroup(dto: CreateUserGroupDto & { permissions?: string[] }) {
    await this.validateParent(dto.parentId, dto.type);
    await this.validatePermissions(dto.permissions);
    return this.create(dto);
  }

  async updateGroup(id: string, dto: Partial<UpdateUserGroupDto>) {
    const group = await this.findById(id);
    if (!group) return null;

    const parentId = dto.parentId === undefined ? group.parentId : dto.parentId;
    const type = dto.type ?? group.type;
    if (parentId && (String(parentId) !== String(group.parentId) || type !== group.type)) {
      await this.validateParent(String(parentId), type, id);
    }

    // Existing roles can contain references to permissions deleted from the catalog.
    const currentPermissions = new Set(group.permissions ?? []);
    await this.validatePermissions(
      dto.permissions?.filter((permission) => !currentPermissions.has(permission)),
    );
    return this.findByIdAndUpdate(id, dto);
  }

  private async validatePermissions(ids?: string[]) {
    if (!ids?.length) return;
    const count = await this.permissionsService.count({ _id: { $in: ids } });
    if (count !== ids.length) {
      throw new BadRequestException('یک یا چند مجوز انتخاب‌شده وجود ندارد.');
    }
  }

  private async validateParent(parentId: string | null, type: string, id?: string) {
    if (!parentId) return;
    const visited = new Set(id ? [id.toLowerCase()] : []);
    let ancestorId = parentId.toLowerCase();
    while (ancestorId) {
      if (visited.has(ancestorId)) {
        throw new BadRequestException('انتخاب این والد باعث ایجاد چرخه می‌شود.');
      }
      visited.add(ancestorId);
      const ancestor = await this.findById(ancestorId);
      if (!ancestor || ancestor.type !== type) {
        throw new BadRequestException('والد انتخاب‌شده معتبر نیست.');
      }
      ancestorId = ancestor.parentId ? String(ancestor.parentId) : null;
    }
  }
}
