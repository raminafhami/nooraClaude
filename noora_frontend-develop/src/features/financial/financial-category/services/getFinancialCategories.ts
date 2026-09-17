import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { FinancialCategory } from "../models/FinancialCategory";
import {
	FinancialCategoryBaseQuery,
	FinancialCategoryPageQuery,
	FinancialCategoryQuery,
} from "../models/FinancialCategoryQuery";

async function getFinancialCategories(
	options?: FinancialCategoryBaseQuery,
): Promise<FinancialCategory[]>;

async function getFinancialCategories(
	options: FinancialCategoryPageQuery,
): Promise<EntityPageResult<FinancialCategory>>;

async function getFinancialCategories(
	options: FinancialCategoryQuery = {},
): Promise<FinancialCategory[] | EntityPageResult<FinancialCategory>> {
	const response = await apiClient.query<FinancialCategory>({
		url: "category",
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

export { getFinancialCategories };
