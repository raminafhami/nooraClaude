import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { PettyCashApi } from "../models/PettyCash";
import {
	PettyCashBaseQuery,
	PettyCashPageQuery,
	PettyCashQuery,
} from "../models/PettyCashQuery";

async function getPettyCash(
	options?: PettyCashBaseQuery,
): Promise<PettyCashApi[]>;

async function getPettyCash(
	options: PettyCashPageQuery,
): Promise<EntityPageResult<PettyCashApi>>;

async function getPettyCash(
	options: PettyCashQuery = {},
): Promise<PettyCashApi[] | EntityPageResult<PettyCashApi>> {
	const response = await apiClient.query<PettyCashApi>({
		url: "petty-cash",
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

export { getPettyCash };
