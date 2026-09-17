import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { DispatcherCategory } from "../models/DispatcherCategory";
import {
	DispatcherCategoryBaseQuery,
	DispatcherCategoryPageQuery,
	DispatcherCategoryQuery,
} from "../models/DispatcherCategoryQuery";

async function getDispatcherCategories(
	options?: DispatcherCategoryBaseQuery,
): Promise<DispatcherCategory[]>;

async function getDispatcherCategories(
	options: DispatcherCategoryPageQuery,
): Promise<EntityPageResult<DispatcherCategory>>;

async function getDispatcherCategories(
	options: DispatcherCategoryQuery = {},
): Promise<DispatcherCategory[] | EntityPageResult<DispatcherCategory>> {
	const response = await apiClient.query<DispatcherCategory>({
		url: "dispatcher-category",
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

export { getDispatcherCategories };
