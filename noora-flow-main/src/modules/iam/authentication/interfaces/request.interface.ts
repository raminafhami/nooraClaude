import { AnyObject } from '@casl/ability/dist/types/types';

import { CaslRequestCache } from './casl-request-cache.interface';
import { ActiveUserData } from './active-user-data.interface';

export interface AuthorizableRequest<
  User extends ActiveUserData = ActiveUserData,
  Subject = AnyObject,
> {
  user?: User;
  currentUser?: User;
  casl: CaslRequestCache<User, Subject>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ContextWithAuthorizableRequest<
  User extends ActiveUserData = ActiveUserData,
  Subject = AnyObject,
> {
  req: AuthorizableRequest<User, Subject>;
}
