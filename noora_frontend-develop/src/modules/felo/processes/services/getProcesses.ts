import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import {
	Process,
	ProcessApi,
	ProcessBaseQuery,
	ProcessPagedQuery,
	ProcessQuery,
} from "../models";
import parseProcess from "../utils/parseProcess";

async function getProcesses(
	options?: Partial<ProcessBaseQuery>,
): Promise<Process[]>;

async function getProcesses(
	options?: Partial<ProcessPagedQuery>,
): Promise<PagedResult<Process>>;

async function getProcesses(
	options: ProcessQuery = {},
): Promise<Process[] | PagedResult<Process>> {
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
		return parseProcess(response.result.data);
	}

	return new PagedResult(
		parseProcess(response.result.data),
		page,
		pageSize,
		response.result.count,
	);
}

export { getProcesses };
