import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { KpiApi } from "../models/Kpi";
import { KpiBaseQuery, KpiPageQuery, KpiQuery } from "../models/KpiQuery";

async function getKpi(options?: KpiBaseQuery): Promise<KpiApi[]>;

async function getKpi(options: KpiPageQuery): Promise<EntityPageResult<KpiApi>>;

async function getKpi(
	options: KpiQuery = {},
): Promise<KpiApi[] | EntityPageResult<KpiApi>> {
	const response = await apiClient.query<KpiApi>({
		url: "kpi",
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

export { getKpi };
