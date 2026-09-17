import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { PettyCategoryAndBudget } from "../models/PettyCategoryAndBudget";
import {
	PettyCategoryAndBudgetBaseQuery,
	PettyCategoryAndBudgetPageQuery,
	PettyCategoryAndBudgetQuery,
} from "../models/PettyCategoryAndBudgetQuery";

async function getPettyCategories(
	options?: PettyCategoryAndBudgetBaseQuery,
): Promise<PettyCategoryAndBudget[]>;

async function getPettyCategories(
	options: PettyCategoryAndBudgetPageQuery,
): Promise<EntityPageResult<PettyCategoryAndBudget>>;

async function getPettyCategories(
	options: PettyCategoryAndBudgetQuery = {},
): Promise<
	PettyCategoryAndBudget[] | EntityPageResult<PettyCategoryAndBudget>
> {
	const response = await apiClient.query<PettyCategoryAndBudget>({
		url: "category/budget-amount",
		queryOptions: options,
	});

	if (!options.pagination) {
		return response.result.data;
	}

	return {
		items: response.result.data,
		page: options.pagination.page,
		pageSize: options.pagination.pageSize,
		total: response.result.count,
	};
}

export { getPettyCategories };
