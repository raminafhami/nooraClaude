import { AnyClass, AnyObject } from '@casl/ability/dist/types/types';

import { AuthorizableRequest } from './request.interface';
import { ActiveUserData } from './active-user-data.interface';

export interface SubjectBeforeFilterHook<
  Subject = AnyObject,
  Request = AuthorizableRequest<ActiveUserData, Subject>,
> {
  run: (request: Request) => Promise<Subject | undefined>;
}

export type SubjectBeforeFilterTuple<
  Subject = AnyObject,
  Request = AuthorizableRequest<ActiveUserData, Subject>,
> = [
  AnyClass,
  (service: InstanceType<AnyClass>, request: Request) => Promise<Subject>,
];

export interface UserBeforeFilterHook<
  User extends ActiveUserData,
  RequestUser = User,
> {
  run: (user: RequestUser) => Promise<User | undefined>;
}

export type UserBeforeFilterTuple<
  User extends ActiveUserData,
  RequestUser = User,
> = [
  AnyClass,
  (service: InstanceType<AnyClass>, user: RequestUser) => Promise<User>,
];
