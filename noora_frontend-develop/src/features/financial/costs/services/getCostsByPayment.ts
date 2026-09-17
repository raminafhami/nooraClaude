import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import { Cost } from "../models/Cost";
import { CostApi } from "../models/CostApi";
import { CostBaseQuery, CostPagedQuery, CostQuery } from "../models/CostQuery";
import { parseCost } from "../utils/parseCost";

async function getCostsByPayment(
	paymentId: string,
	options?: Partial<CostBaseQuery>,
): Promise<Cost[]>;

async function getCostsByPayment(
	paymentId: string,
	options?: Partial<CostPagedQuery>,
): Promise<PagedResult<Cost>>;

async function getCostsByPayment(
	paymentId: string,
	options: CostQuery = {},
): Promise<Cost[] | PagedResult<Cost>> {
	let page: number = options.pagination?.page ?? 0;
	let pageSize: number =
		options.pagination?.pageSize ?? Number.MAX_SAFE_INTEGER;

	const response = await apiClient.get<PagedResultApiModel<CostApi>>({
		url: `/inspection-costs/payments/${paymentId}?page=${page}&size=${pageSize}&filters=${JSON.stringify(
			options.filters ?? {},
		)}&sort=${
			Object.keys(options.sort ?? {}).length !== 0
				? JSON.stringify(options.sort)
				: ""
		}&populate=${options.populate?.join(" ") || ""}`,
	});

	if (!options.pagination) {
		return parseCost(response.result.data);
	}

	return new PagedResult(
		parseCost(response.result.data),
		page,
		pageSize,
		response.result.count,
	);
}

export { getCostsByPayment };
