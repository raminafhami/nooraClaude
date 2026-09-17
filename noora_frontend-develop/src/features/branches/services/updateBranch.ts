import apiClient from "@/api/client";

import { Branch, BranchApi } from "../models/Branch";
import { parseBranch } from "../utils/parseBranch";

interface BranchUpdateModel {
  name?: string;
  title?: string;
  managerId?: string | null;
}

interface BranchUpdateReturn extends Branch {}

interface BranchUpdateApiModel {
  name?: string;
  title?: string;
  metadata?: { managerId: string | null };
}

interface BranchUpdateApiReturn extends BranchApi {}

export async function updateBranch(
  id: string,
  details: BranchUpdateModel,
): Promise<BranchUpdateReturn> {
  const data: BranchUpdateApiModel = {};
  const keys = Object.keys(details) as (keyof BranchUpdateModel)[];

  keys.includes("name") && (data.name = details.name);
  keys.includes("title") && (data.title = details.title);
  keys.includes("managerId") &&
    (data.metadata = { managerId: details.managerId as string | null });

  const response = await apiClient.put<BranchUpdateApiReturn>({
    url: `/user-groups/${id}`,
    body: data,
  });

  return parseBranch(response.result);
}
