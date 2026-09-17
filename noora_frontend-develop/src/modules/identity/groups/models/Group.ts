import { User, UserApi } from "@/identity/users/models/User";

import { UserGroupType } from "./GroupType";

export interface UserGroup {
  id: string;
  type: UserGroupType;
  name: string;
  title: string;
  metadata: any;
  parent?: string | UserGroup;

  children?: UserGroup[];
  users?: User[];
}

export interface UserGroupApi {
  id: string;
  parentId?: string;
  type: UserGroupType;
  name: string;
  title: string;
  metadata: any;
  parent?: UserGroupApi;
  children?: UserGroupApi[];
  users?: UserApi[];
}

export interface UserGroupDb extends Omit<UserGroupApi, "id"> {
  _id: string;
}
