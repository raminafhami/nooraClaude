import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { PettyCostApi } from "../models/PettyCost";
import {
	PettyCostBaseQuery,
	PettyCostPageQuery,
	PettyCostQuery,
} from "../models/PettyCostQuery";

async function getPettyCost(
	options?: PettyCostBaseQuery,
): Promise<PettyCostApi[]>;

async function getPettyCost(
	options: PettyCostPageQuery,
): Promise<EntityPageResult<PettyCostApi>>;

async function getPettyCost(
	options: PettyCostQuery = {},
): Promise<PettyCostApi[] | EntityPageResult<PettyCostApi>> {
	const response = await apiClient.query<PettyCostApi>({
		url: "petty-cost",
		queryOptions: options,
		// $and: false,
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

export { getPettyCost };
