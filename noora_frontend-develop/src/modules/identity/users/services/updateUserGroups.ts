import apiClient from "@/api/client";
import { UserGroup } from "@/identity/groups/models/Group";

import getUserById from "./getUserById";

interface UserUpdateGroupsModel {
  userId: string;
  groupType: string;
  groups: string[];
}

export async function updateUserGroups({
  userId,
  groupType,
  groups,
}: UserUpdateGroupsModel): Promise<boolean> {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("user is not found.");
  }

  const userGroups = user.groups as UserGroup[];

  const newUserGroups = [...groups];
  const updatedUserGroups: string[] = [];
  userGroups.forEach((userGroup) => {
    if (userGroup.type !== groupType) {
      updatedUserGroups.push(userGroup.id);
    } else {
      const userGroupIndex = newUserGroups.indexOf(userGroup.id);

      if (userGroupIndex !== -1) {
        updatedUserGroups.push(userGroup.id);
        newUserGroups.splice(userGroupIndex, 1);
      }
    }
  });
  updatedUserGroups.push(...newUserGroups);

  const response = await apiClient.put({
    url: `/users/${userId}`,
    body: {
      groups: updatedUserGroups,
    },
  });

  return true;
}
