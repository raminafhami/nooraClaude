import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import {
	ProcessApi,
	ProcessBaseQuery,
	ProcessPagedQuery,
	ProcessQuery,
} from "../models";

async function getRawProcessDefinitions(
	options?: Partial<ProcessBaseQuery>,
): Promise<ProcessApi[]>;

async function getRawProcessDefinitions(
	options?: Partial<ProcessPagedQuery>,
): Promise<PagedResult<ProcessApi>>;

async function getRawProcessDefinitions(
	options: ProcessQuery = {},
): Promise<ProcessApi[] | PagedResult<ProcessApi>> {
	let page: number = options.pagination?.page ?? 0;
	let pageSize: number =
		options.pagination?.pageSize ?? Number.MAX_SAFE_INTEGER;

	const response = await apiClient.get<PagedResultApiModel<ProcessApi>>({
		url: `process-definitions/all/records?page=${page}&size=${pageSize}&filters=${JSON.stringify(
			options.filters ?? {},
		)}&sort=${
			Object.keys(options.sort ?? {}).length !== 0
				? JSON.stringify(options.sort)
				: ""
		}`,
	});

	if (!options.pagination) {
		return response.result.data;
	}

	return new PagedResult(
		response.result.data,
		page,
		pageSize,
		response.result.count,
	);
}

export { getRawProcessDefinitions };
