import apiClient from "@/api/client";
import { ApiPageResult } from "@/api/models/ApiResponse";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Indicator } from "../models/Indicator";
import {
  IndicatorBaseQuery,
  IndicatorPagedQuery,
  IndicatorQuery,
} from "../models/IndicatorQuery";

async function getIndicators(
  options?: Partial<IndicatorBaseQuery>,
): Promise<Indicator[]>;

async function getIndicators(
  options?: Partial<IndicatorPagedQuery>,
): Promise<EntityPageResult<Indicator>>;

async function getIndicators(
  options: IndicatorQuery = {},
): Promise<Indicator[] | EntityPageResult<Indicator>> {
  let page: number = options.pagination?.page ?? 0;
  let pageSize: number =
    options.pagination?.pageSize ?? Number.MAX_SAFE_INTEGER;

  const response = await apiClient.get<ApiPageResult<Indicator>>({
    url: `indicator?page=${page}&size=${pageSize}&filters=${JSON.stringify(
      options.filters ?? {},
    )}&sort=${
      Object.keys(options.sort ?? {}).length !== 0
        ? JSON.stringify(options.sort)
        : ""
    }`,
  });

  if (!options.pagination) {
    return response.result.data;
  }

  return {
    items: response.result.data,
    page,
    pageSize,
    total: response.result.count,
  };
}

export { getIndicators };
