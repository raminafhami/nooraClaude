import { Personnel } from "@/hrm/personnel/models/Personnel";

import { Branch, BranchApi } from "../models/Branch";

export function parseBranch(
  from: BranchApi,
  manager?: Personnel | null
): Branch;
export function parseBranch(from: BranchApi[], manager?: Personnel[]): Branch[];
export function parseBranch(
  from: BranchApi | BranchApi[],
  manager?: Personnel | Personnel[] | null
): Branch | Branch[] {
  if (Array.isArray(from)) {
    return from.map((x) =>
      parseBranch(
        x,
        (manager as Personnel[])?.find(
          (y) => x.metadata?.managerId === y.userId
        )
      )
    );
  }

  let result: Branch = {
    id: from.id,
    name: from.name,
    title: from.title,
    managerId: from.metadata?.managerId,
    manager: (manager as Personnel) || null,
  };

  return result;
}
