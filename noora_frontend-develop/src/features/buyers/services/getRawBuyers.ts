import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { BuyerApi } from "../models/BuyerApi";
import {
	BuyerBaseQuery,
	BuyerPageQuery,
	BuyerQuery,
} from "../models/BuyerQuery";

async function getRawBuyers(options?: BuyerBaseQuery): Promise<BuyerApi[]>;

async function getRawBuyers(
	options: BuyerPageQuery,
): Promise<EntityPageResult<BuyerApi>>;

async function getRawBuyers(
	options: BuyerQuery = {},
): Promise<BuyerApi[] | EntityPageResult<BuyerApi>> {
	const response = await apiClient.query<BuyerApi>({
		url: "buyers",
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

export { getRawBuyers };
