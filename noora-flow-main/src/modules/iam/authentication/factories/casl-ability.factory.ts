import {
  Ability,
  MongoAbility,
  MongoQuery,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { PermissionAction } from '../enums';
import {
  Permission,
  PermissionDocument,
} from 'src/modules/permissions/schemas/permission.schema';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { AuthenticationService } from '../authentication.service';

export type SubjectsType = any;
type Conditions = MongoQuery;
export type AppAbility = MongoAbility<
  [PermissionAction, SubjectsType],
  Conditions
>;
interface CaslPermission {
  action: PermissionAction[];
  subject: string;
  conditions?: any;
}
@Injectable()
export class CaslAbilityFactory {
  constructor(private authenticationService: AuthenticationService) {}
  async createForUser(user: ActiveUserData): Promise<AppAbility> {
    const dbPermissions: PermissionDocument[] =
      await this.authenticationService.findAllPermissionsOfUser(user.id);

    const caslPermissions: CaslPermission[] = dbPermissions?.map((p) => {
      return {
        action: p.actions,
        subject: p.subject,
        conditions: Permission.parseCondition(JSON.parse(p.conditions), user),
      } as CaslPermission;
    });

    return createMongoAbility<AppAbility>(caslPermissions);
  }
}
