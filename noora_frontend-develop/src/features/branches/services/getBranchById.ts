import apiClient from "@/api/client";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";

import { Branch, BranchApi } from "../models/Branch";
import { parseBranch } from "../utils/parseBranch";

export async function getBranchById(id: string): Promise<Branch> {
  const response = await apiClient.get<BranchApi>({
    url: `/user-groups/${id}`,
  });

  const managerId = response.result.metadata.managerId;
  const manager = managerId
    ? await getPersonnelById(managerId, ["user"])
    : null;

  return parseBranch({ ...response.result }, manager);
}
