import apiClient from "@/api/client";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import { Branch, BranchApi } from "../models/Branch";
import {
  BranchBaseQuery,
  BranchPagedQuery,
  BranchQuery,
} from "../models/BranchQuery";
import { parseBranch } from "../utils/parseBranch";

export async function getBranches(
  options?: Partial<BranchBaseQuery>,
): Promise<Branch[]>;
export async function getBranches(
  options?: Partial<BranchPagedQuery>,
): Promise<PagedResult<Branch>>;
export async function getBranches(
  options: BranchQuery = {},
): Promise<Branch[] | PagedResult<Branch>> {
  let filters: any = {};
  let search: any = {};

  if (!options.filters) {
    options.filters = [];
  }
  options.filters.push({ name: "type", value: UserGroupType.Branch });

  if (options.filters) {
    options.filters.forEach((filter) => {
      switch (filter.name) {
        default:
          if (!filter.type || filter.type === "match") {
            filters[filter.name] = filter.value;
          } else if (filter.type === "search") {
            search[filter.name] = filter.value;
          }
      }
    });
  }

  let pageNo: number;
  let pageSize: number;
  if (options.page) {
    if (typeof options.page === "number") {
      pageNo = options.page;
      pageSize = 10;
    } else {
      pageNo = options.page.no;
      pageSize = options.page.size;
    }
  } else {
    pageNo = 0;
    pageSize = Number.MAX_SAFE_INTEGER;
  }

  const response = await apiClient.get<PagedResultApiModel<BranchApi>>({
    url: `/user-groups?page=${pageNo}&size=${pageSize}&filters=${
      Object.keys(filters).length !== 0 ? JSON.stringify(filters) : ""
    }&search=${
      Object.keys(search).length !== 0 ? JSON.stringify(search) : ""
    }&sort=${
      Object.keys(options.sort ?? {}).length !== 0
        ? JSON.stringify(options.sort)
        : ""
    }`,
  });

  const managerIds = response.result.data
    .map((x) => x.metadata.managerId)
    .filter((x) => x) as string[];
  const managers =
    managerIds.length !== 0
      ? await getPersonnel({
          filters: [
            {
              name: "userId",
              value: response.result.data
                .map((x) => x.metadata.managerId)
                .filter((x) => x),
            },
          ],
        })
      : [];

  if (!options.page) {
    return parseBranch(response.result.data, managers);
  }

  return new PagedResult(
    parseBranch(response.result.data, managers),
    pageNo,
    pageSize,
    response.result.count,
  );
}
