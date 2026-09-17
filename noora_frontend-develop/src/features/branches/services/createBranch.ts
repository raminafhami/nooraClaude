import apiClient from "@/api/client";
import { UserGroupType } from "@/identity/groups/models/GroupType";

import { Branch, BranchApi } from "../models/Branch";
import { parseBranch } from "../utils/parseBranch";

interface BranchCreateModel {
  name: string;
  title: string;
}

interface BranchCreateReturn extends Branch {}

interface BranchCreateApiModel {
  name: string;
  title: string;
}

interface BranchCreateApiReturn extends BranchApi {}

export async function createBranch(
  details: BranchCreateModel,
): Promise<BranchCreateReturn> {
  const data: BranchCreateApiModel = {
    name: details.name,
    title: details.title,
  };

  const response = await apiClient.post<BranchCreateApiReturn>({
    url: `/user-groups`,
    body: {
      ...data,
      type: UserGroupType.Branch,
      parentId: null,
      metadata: { managerId: null },
    },
  });

  return parseBranch(response.result);
}
