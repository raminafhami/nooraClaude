import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Debt } from "../models/Debt";
import { DebtApi } from "../models/DebtApi";
import { DebtBaseQuery, DebtPageQuery, DebtQuery } from "../models/DebtQuery";
import { parseDebt } from "../utils/parseDebt";

async function getMyDebts(options?: DebtBaseQuery): Promise<Debt[]>;

async function getMyDebts(
  options: DebtPageQuery,
): Promise<EntityPageResult<Debt>>;

async function getMyDebts(
  options: DebtQuery = {},
): Promise<Debt[] | EntityPageResult<Debt>> {
  const response = await apiClient.query<DebtApi>({
    url: "users/debts/list",
    queryOptions: options,
  });

  if (!options.pagination) {
    return parseDebt(response.result.data);
  }

  return {
    items: parseDebt(response.result.data),
    page: options.pagination.page,
    pageSize: options.pagination.pageSize,
    total: response.result.count,
  };
}

export { getMyDebts };
