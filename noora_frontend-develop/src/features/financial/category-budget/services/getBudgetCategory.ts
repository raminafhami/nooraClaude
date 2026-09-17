import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { CategoryBudget } from "../models/CategoryBudget";
import {
	CategoryBudgetBaseQuery,
	CategoryBudgetPageQuery,
	CategoryBudgetQuery,
} from "../models/CategoryBudgetQuery";

async function getCategoryBudget(
	options?: CategoryBudgetBaseQuery,
): Promise<CategoryBudget[]>;

async function getCategoryBudget(
	options: CategoryBudgetPageQuery,
): Promise<EntityPageResult<CategoryBudget>>;

async function getCategoryBudget(
	options: CategoryBudgetQuery = {},
): Promise<CategoryBudget[] | EntityPageResult<CategoryBudget>> {
	const response = await apiClient.query<CategoryBudget>({
		url: "category-budget",
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

export { getCategoryBudget };
