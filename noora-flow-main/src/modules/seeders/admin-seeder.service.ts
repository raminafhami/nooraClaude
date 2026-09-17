import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { HashingService } from '../iam/hashing-and-encryption/hashing.service';
import { PermissionAction, Subjects } from '../iam/authentication/enums';
import {
  Permission,
  PermissionDocument,
} from '../permissions/schemas/permission.schema';
import {
  USER_GROUP_TYPE,
  UserGroup,
  UserGroupDocument,
} from '../user-groups/schemas/user-group.schema';
import {
  LoginTypes,
  User,
  UserDocument,
  UserTypes,
} from '../users/schemas/user.schema';

export const SUPER_ADMIN_GROUP = 'super-admin';

/**
 * Creates the super-admin permission, group and user required by a fresh
 * installation. Idempotent: every step is "find, otherwise create", so running
 * it repeatedly never produces a duplicate admin and never overwrites the
 * password of an admin that already exists.
 */
@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserGroup.name)
    private readonly userGroupModel: Model<UserGroup>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
    private readonly hashingService: HashingService,
  ) {}

  /**
   * Opt-in startup seeding. Disabled by default: with more than one replica,
   * every instance would seed at once. Deployments that run a single instance
   * can set SEED_ADMIN_ON_STARTUP=true; everyone else runs `npm run seed`.
   */
  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_ADMIN_ON_STARTUP !== 'true') return;

    try {
      await this.seedAdmin();
    } catch (error) {
      // Never take the application down because seeding failed.
      this.logger.error(`Startup admin seeding skipped: ${error?.message}`);
    }
  }

  async seedAdmin(): Promise<{ created: boolean; phoneNo: string }> {
    const phoneNo = process.env.ADMIN_PHONE;
    const password = process.env.ADMIN_PASSWORD;

    if (!phoneNo || !password) {
      throw new Error(
        'ADMIN_PHONE and ADMIN_PASSWORD must be set in the environment before seeding the admin user.',
      );
    }

    const permission = await this.ensureManageAllPermission();
    const group = await this.ensureSuperAdminGroup(permission);

    const existing: UserDocument = await this.userModel.findOne({ phoneNo });

    if (existing) {
      await this.ensureAdminGroupMembership(existing, group);
      this.logger.log(
        `Admin ${phoneNo} already exists - no duplicate created.`,
      );
      return { created: false, phoneNo };
    }

    await this.userModel.create({
      name: 'System',
      lastname: 'Administrator',
      username: phoneNo,
      phoneNo,
      password: await this.hashingService.hash(password),
      phoneValidated: true,
      setPassword: true,
      isActive: true,
      // Not UserTypes.NORMAL: the login flow rejects `normal` users whose
      // request origin is not the public customer portal.
      type: UserTypes.SYSTEM,
      // Password login only - this deployment does not use OTP.
      loginType: LoginTypes.PASSWORD,
      groups: [group._id],
    });

    this.logger.log(`Admin ${phoneNo} created.`);
    return { created: true, phoneNo };
  }

  private async ensureManageAllPermission(): Promise<PermissionDocument> {
    const query = {
      subject: Subjects.ALL,
      actions: PermissionAction.MANAGE,
    };

    const existing: PermissionDocument = await this.permissionModel.findOne(
      query,
    );
    if (existing) return existing;

    return this.permissionModel.create({
      actions: [PermissionAction.MANAGE],
      subject: Subjects.ALL,
      conditions: '{}',
      description: 'Full access - super administrator',
    });
  }

  private async ensureSuperAdminGroup(
    permission: PermissionDocument,
  ): Promise<UserGroupDocument> {
    const existing: UserGroupDocument = await this.userGroupModel.findOne({
      name: SUPER_ADMIN_GROUP,
    });

    if (existing) {
      const permissions = (existing.permissions ?? []).map(String);
      if (!permissions.includes(String(permission._id))) {
        await this.userGroupModel.updateOne(
          { _id: existing._id },
          { $addToSet: { permissions: permission._id } },
        );
      }
      return existing;
    }

    return this.userGroupModel.create({
      name: SUPER_ADMIN_GROUP,
      title: 'مدیر ارشد سیستم',
      type: USER_GROUP_TYPE.ROLE,
      permissions: [permission._id],
    });
  }

  private async ensureAdminGroupMembership(
    user: UserDocument,
    group: UserGroupDocument,
  ): Promise<void> {
    const groups = (user.groups ?? []).map(String);
    if (groups.includes(String(group._id))) return;

    await this.userModel.updateOne(
      { _id: user._id },
      { $addToSet: { groups: group._id } },
    );
    this.logger.log('Existing admin was missing the super-admin group; added.');
  }
}
