import apiClient from "@/api/client";

import { UserGroup, UserGroupApi } from "../models/Group";
import { UserGroupType } from "../models/GroupType";
import { parseGroup } from "../utils/parseGroup";

interface GroupCreateModel {
  type: UserGroupType;
  name: string;
  title: string;
  metadata?: any;
  parent?: string | null;
}

interface GroupCreateReturn extends UserGroup {}

interface GroupCreateApiModel {
  type: UserGroupType;
  name: string;
  title: string;
  metadata: any;
  parentId: string | null;
}

interface GroupCreateApiReturn extends UserGroupApi {}

export async function createGroup(
  details: GroupCreateModel,
): Promise<GroupCreateReturn> {
  const data: GroupCreateApiModel = {
    name: details.name,
    title: details.title,
    type: details.type,
    metadata: details.metadata || {},
    parentId: details.parent || null,
  };

  const response = await apiClient.post<GroupCreateApiReturn>({
    url: "/user-groups",
    body: data,
  });

  return parseGroup(response.result);
}
