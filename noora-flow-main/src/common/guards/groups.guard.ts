import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { REQUEST_USER_KEY } from './../../modules/iam/iam.constants';

import { Observable } from 'rxjs';
import * as basicAuth from 'basic-auth';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GroupsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    const user = request[REQUEST_USER_KEY];
    const passed = requiredRoles.some((role) => user.groups.includes(role));
    return !!passed;
  }
}
