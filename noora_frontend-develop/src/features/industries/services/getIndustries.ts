import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Industry } from "../models/Industry";
import { IndustryApi } from "../models/IndustryApi";
import {
  IndustryBaseQuery,
  IndustryPageQuery,
  IndustryQuery,
} from "../models/IndustryQuery";
import { parseIndustry } from "../utils/parseIndustry";

async function getIndustries(options?: IndustryBaseQuery): Promise<Industry[]>;

async function getIndustries(
  options: IndustryPageQuery,
): Promise<EntityPageResult<Industry>>;

async function getIndustries(
  options: IndustryQuery = {},
): Promise<Industry[] | EntityPageResult<Industry>> {
  const response = await apiClient.query<IndustryApi>({
    url: "industry",
    queryOptions: options,
  });

  if (!options.pagination) {
    return parseIndustry(response.result.data);
  }

  return {
    items: parseIndustry(response.result.data),
    page: options.pagination.page,
    pageSize: options.pagination.pageSize,
    total: response.result.count,
  };
}

export { getIndustries };
