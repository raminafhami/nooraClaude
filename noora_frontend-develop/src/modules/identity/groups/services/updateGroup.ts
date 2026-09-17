import apiClient from "@/api/client";

import { UserGroup, UserGroupApi } from "../models/Group";
import { parseGroup } from "../utils/parseGroup";

interface GroupUpdateModel {
  name?: string;
  title?: string;
  metadata?: any;
  parent?: string | null;
}

interface GroupUpdateReturn extends UserGroup {}

interface GroupUpdateApiModel {
  name?: string;
  title?: string;
  metadata?: any;
  parentId?: string | null;
}

interface GroupUpdateApiReturn extends UserGroupApi {}

export async function updateGroup(
  id: string,
  details: GroupUpdateModel,
): Promise<GroupUpdateReturn> {
  const data: GroupUpdateApiModel = {};
  const keys = Object.keys(details) as (keyof GroupUpdateModel)[];

  keys.includes("name") && (data.name = details.name);
  keys.includes("title") && (data.title = details.title);
  keys.includes("parent") && (data.parentId = details.parent);
  keys.includes("metadata") && (data.metadata = details.metadata);

  const response = await apiClient.put<GroupUpdateApiReturn>({
    url: `/user-groups/${id}`,
    body: data,
  });

  return parseGroup(response.result);
}
