import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import { UserGroup, UserGroupApi } from "../models/Group";
import {
  GroupBaseQuery,
  GroupPagedQuery,
  GroupQuery,
} from "../models/GroupQuery";
import { UserGroupType } from "../models/GroupType";
import { parseGroup } from "../utils/parseGroup";

export async function getGroups(
  type: UserGroupType | null,
  options?: Partial<GroupBaseQuery>,
): Promise<UserGroup[]>;
export async function getGroups(
  type: UserGroupType | null,
  options?: Partial<GroupPagedQuery>,
): Promise<PagedResult<UserGroup>>;
export async function getGroups(
  type: UserGroupType | null,
  options: GroupQuery = {},
): Promise<UserGroup[] | PagedResult<UserGroup>> {
  let filters: any = {};
  let search: any = {};

  type && (filters.type = type);

  if (options.filters) {
    options.filters.forEach((filter) => {
      if (!filter.type || filter.type === "match") {
        filters[filter.name] = filter.value;
      } else if (filter.type === "search") {
        search[filter.name] = filter.value;
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

  const response = await apiClient.get<PagedResultApiModel<UserGroupApi>>({
    url: `/user-groups?page=${pageNo}&size=${pageSize}&filters=${
      Object.keys(filters).length !== 0 ? JSON.stringify(filters) : ""
    }&search=${
      Object.keys(search).length !== 0 ? JSON.stringify(search) : ""
    }&sort=${
      Object.keys(options.sort || {}).length !== 0
        ? JSON.stringify(options.sort)
        : ""
    }`,
  });

  if (!options.page) {
    return parseGroup(response.result.data);
  }

  return new PagedResult(
    parseGroup(response.result.data),
    pageNo,
    pageSize,
    response.result.count,
  );
}
