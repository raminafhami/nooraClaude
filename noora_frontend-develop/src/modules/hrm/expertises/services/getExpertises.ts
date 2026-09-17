import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Expertise } from "../models/Expertise";
import {
	ExpertiseBaseQuery,
	ExpertisePageQuery,
	ExpertiseQuery,
} from "../models/ExpertiseQuery";

async function getExpertises(
	options?: ExpertiseBaseQuery,
): Promise<Expertise[]>;

async function getExpertises(
	options: ExpertisePageQuery,
): Promise<EntityPageResult<Expertise>>;

async function getExpertises(
	options: ExpertiseQuery = {},
): Promise<Expertise[] | EntityPageResult<Expertise>> {
	const response = await apiClient.query<Expertise>({
		url: "expertise",
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

export { getExpertises };
