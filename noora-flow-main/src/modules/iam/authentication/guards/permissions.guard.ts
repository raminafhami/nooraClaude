import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import {
  AppAbility,
  CaslAbilityFactory,
} from '../factories/casl-ability.factory';
import {
  PERMISSION_CHECKER_KEY,
  RequiredPermission,
} from '../decorators/permissions.decorator';
import { PermissionAction } from '../enums';
import { AccessTokenGuard } from './access-token.guard';
import { subject } from '@casl/ability';
import { subjectHookFactory } from '../factories/subject-hook.factory';
import {
  SubjectBeforeFilterHook,
  SubjectBeforeFilterTuple,
} from '../interfaces/hooks.interface';
import { AnyClass } from '@casl/ability/dist/types/types';
import { AuthenticationGuard } from './authentication.guard';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly abilityFactory: CaslAbilityFactory,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly authenticationGuard: AuthenticationGuard,
    private moduleRef: ModuleRef,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions =
      this.reflector.get<RequiredPermission[]>(
        PERMISSION_CHECKER_KEY,
        context.getHandler(),
      ) || [];
    const req = context.switchToHttp().getRequest();

    if (requiredPermissions.length == 0) {
      return true;
    }

    const canAccess = await this.authenticationGuard.canActivate(context);

    // todo need to be deleted
    return canAccess;

    if (!canAccess) {
      return false;
    }

    const ability = await this.abilityFactory.createForUser(req.user);

    const chekAllPermission = await Promise.all(
      requiredPermissions.map(async ({ action, subject, subjectHook }) => {
        if (subjectHook) {
          const hookData = await this._getHookData(subjectHook, req);
          return this._isAllowedWithHook(ability, action, subject, hookData);
        }
        return this._isAllowed(ability, action, subject);
      }),
    );

    return chekAllPermission.every((p) => p);
  }

  private _isAllowed(
    ability: AppAbility,
    action: PermissionAction,
    subjectType: string,
  ): boolean {
    return ability.can(action, subjectType);
  }
  private _isAllowedWithHook(
    ability: AppAbility,
    action: PermissionAction,
    subjectType: string,
    data: any,
  ): boolean {
    return ability.can(action, subject(subjectType, data));
  }

  private async _getHookData(
    hook: AnyClass<SubjectBeforeFilterHook> | SubjectBeforeFilterTuple,
    req: any,
  ) {
    const hookFunc = await subjectHookFactory(this.moduleRef, hook);
    return hookFunc.run(req);
  }
}
