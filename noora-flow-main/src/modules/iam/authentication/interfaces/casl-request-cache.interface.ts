import { AnyObject } from '@casl/ability/dist/types/types';

import {
  SubjectBeforeFilterHook,
  UserBeforeFilterHook,
} from './hooks.interface';
import { ActiveUserData } from './active-user-data.interface';

export interface CaslRequestCache<
  User extends ActiveUserData,
  Subject = AnyObject,
> {
  user?: User;
  subject?: Subject;
  hooks: {
    user: UserBeforeFilterHook<User>;
    subject: SubjectBeforeFilterHook<Subject>;
  };
}
