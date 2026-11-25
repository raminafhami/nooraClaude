import apiClient from "@/api/client";
import { UserGroup } from "@/identity/groups/models/Group";

import getUserById from "./getUserById";

interface UserUpdateGroupsModel {
  userId: string;
  groups: string[];
  roles: string[];
}

export async function updateUserGroups({
  userId,
  groups,
  roles,
}: UserUpdateGroupsModel): Promise<boolean> {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("user is not found.");
  }

  const userGroups = user.groups as UserGroup[];

  const otherMemberships = (userGroups ?? [])
    .filter((group) => group.type !== "role" && group.type !== "group")
    .map((group) => group.id);

  await apiClient.put({
    url: `/users/${userId}`,
    body: {
      groups: [...new Set([...otherMemberships, ...roles, ...groups])],
    },
  });

  return true;
}
