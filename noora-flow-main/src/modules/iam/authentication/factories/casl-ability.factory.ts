import {
  Ability,
  MongoAbility,
  MongoQuery,
  createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { PermissionAction, Subjects } from '../enums';
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

    const caslPermissions: CaslPermission[] = (dbPermissions ?? []).map((p) => {
      return {
        action: p.actions,
        subject: p.subject,
        conditions: Permission.parseCondition(JSON.parse(p.conditions), user),
      } as CaslPermission;
    });

    // Every signed-in user can file and read their own daily report. The
    // manager screen stays behind the stored «مشاهده گزارش عملکرد» permission
    // (action read). This rule is not a permission document, so it does not
    // appear on the role-permissions page.
    caslPermissions.push({
      action: [PermissionAction.READ_OWN],
      subject: Subjects.PERFORMANCE_REPORT,
    });

    return createMongoAbility<AppAbility>(caslPermissions);
  }
}
