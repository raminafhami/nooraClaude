import parseUser from "@/identity/users/utils/parseUser";

import { UserGroup, UserGroupApi } from "../models/Group";

export function parseGroup(from: UserGroupApi): UserGroup;
export function parseGroup(from: UserGroupApi[]): UserGroup[];
export function parseGroup(
  from: UserGroupApi | UserGroupApi[]
): UserGroup | UserGroup[] {
  if (Array.isArray(from)) {
    return from.map((x) => parseGroup(x));
  }

  let result: UserGroup = {
    id: from.id,
    name: from.name,
    title: from.title,
    type: from.type,
    metadata: from.metadata,
    parent: (from.parent && parseGroup(from.parent)) || from.parentId,
    children: from.children && parseGroup(from.children),
    users: from.users && parseUser(from.users),
  };

  return result;
}
