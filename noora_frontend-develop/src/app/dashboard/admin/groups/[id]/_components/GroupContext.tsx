"use client";

import { createContext, useContext } from "react";

import { UserGroup } from "@/identity/groups/models/Group";
import { User } from "@/identity/users/models/User";

interface GroupContextType {
  group: UserGroup;
  users: User[] | null;
  onGroupUpdate: (group: UserGroup) => void;
  onUsersUpdate: (users: User[]) => void;
}

export const GroupContext = createContext<GroupContextType>(
  {} as GroupContextType
);

export function useGroupContext(): GroupContextType {
  return useContext(GroupContext);
}
