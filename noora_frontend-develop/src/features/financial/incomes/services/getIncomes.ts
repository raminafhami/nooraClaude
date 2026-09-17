import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Income } from "../models/Income";
import { IncomeApi } from "../models/IncomeApi";
import {
	IncomeBaseQuery,
	IncomePageQuery,
	IncomeQuery,
} from "../models/IncomeQuery";
import { parseIncome } from "../utils/parseIncome";

async function getIncomes(options?: IncomeBaseQuery): Promise<Income[]>;

async function getIncomes(
	options: IncomePageQuery,
): Promise<EntityPageResult<Income>>;

async function getIncomes(
	options: IncomeQuery = {},
): Promise<Income[] | EntityPageResult<Income>> {
	const response = await apiClient.query<IncomeApi>({
		url: "income",
		queryOptions: options,
	});

	if (!options.pagination) {
		return parseIncome(response.result.data);
	}

	return {
		items: parseIncome(response.result.data),
		page: options.pagination.page,
		pageSize: options.pagination.pageSize,
		total: response.result.count,
	};
}

export { getIncomes };
