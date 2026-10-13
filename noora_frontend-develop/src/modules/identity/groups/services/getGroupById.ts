import apiClient from "@/api/client";

import { UserGroup, UserGroupApi } from "../models/Group";
import { parseGroup } from "../utils/parseGroup";

export async function getGroupById(
  id: string,
  populate?: string
): Promise<UserGroup> {
  const response = await apiClient.get<UserGroupApi>({
    url: populate
      ? `/user-groups/${id}?populate=${populate}`
      : `/user-groups/${id}`,
  });

  return parseGroup(response.result);
}
