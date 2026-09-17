import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import { Personnel, PersonnelApi } from "../models/Personnel";
import {
  PersonnelBaseQuery,
  PersonnelPagedQuery,
  PersonnelQuery,
} from "../models/PersonnelQuery";
import { parsePersonnel } from "../utils/parsePersonnel";

export async function getPersonnel(
  options?: Partial<PersonnelBaseQuery>,
): Promise<Personnel[]>;
export async function getPersonnel(
  options?: Partial<PersonnelPagedQuery>,
): Promise<PagedResult<Personnel>>;
export async function getPersonnel(
  options: PersonnelQuery = {},
): Promise<Personnel[] | PagedResult<Personnel>> {
  let filters: any = {};
  let search: any = {};

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

  if (!options.populate) {
    options.populate = [];
  }
  options.populate.push("user");

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

  const response = await apiClient.get<PagedResultApiModel<PersonnelApi>>({
    url: `/personnel${`?page=${pageNo}&size=${pageSize}&filters=${
      Object.keys(filters).length !== 0 ? JSON.stringify(filters) : ""
    }&search=${
      Object.keys(search).length !== 0 ? JSON.stringify(search) : ""
    }&sort=${
      Object.keys(options.sort ?? {}).length !== 0
        ? JSON.stringify(options.sort)
        : ""
    }&populate=${options.populate?.join(",") || ""}`}`,
  });

  if (!options.page) {
    return parsePersonnel(response.result.data);
  }

  return new PagedResult(
    parsePersonnel(response.result.data),
    pageNo,
    pageSize,
    response.result.count,
  );
}
