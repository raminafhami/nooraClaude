import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { PermissionAction, Subjects } from '../enums';
import {
  SubjectBeforeFilterHook,
  SubjectBeforeFilterTuple,
} from '../interfaces/hooks.interface';
import { AnyClass, AnyObject, Subject } from '@casl/ability/dist/types/types';
import { AuthorizableRequest } from '../interfaces/request.interface';
export type RequiredPermission<
  Subject = AnyObject,
  Request = AuthorizableRequest,
> = {
  subject: Subjects;
  action: PermissionAction;
  subjectHook?:
    | AnyClass<SubjectBeforeFilterHook<Subject, Request>>
    | SubjectBeforeFilterTuple<Subject, Request>;
};
export const PERMISSION_CHECKER_KEY = 'permission_checker_params_key';
export const CheckPermissions = (
  ...params: RequiredPermission[]
): CustomDecorator<string> => SetMetadata(PERMISSION_CHECKER_KEY, params);
