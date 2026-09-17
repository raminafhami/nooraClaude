import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Debt } from "../models/Debt";
import { DebtApi } from "../models/DebtApi";
import { DebtPageQuery } from "../models/DebtQuery";
import { parseDebt } from "../utils/parseDebt";

type GetUserDebtsReturn = EntityPageResult<Debt> & {
  remainingCredit: number;
};

async function getUserDebts(
  userId: string,
  options: DebtPageQuery,
): Promise<GetUserDebtsReturn> {
  const response = await apiClient.query<DebtApi>({
    url: `users/${userId}/debts/list`,
    queryOptions: options,
  });

  return {
    items: parseDebt(response.result.data),
    remainingCredit: (response.result as any).remainedCredit,
    page: options.pagination.page,
    pageSize: options.pagination.pageSize,
    total: response.result.count,
  };
}

export { getUserDebts };
