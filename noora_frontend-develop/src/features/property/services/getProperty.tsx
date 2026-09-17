import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Property } from "../models/Property";
import {
	PropertyBaseQuery,
	PropertyPageQuery,
	PropertyQuery,
} from "../models/PropertyQuery";

async function getProperty(options?: PropertyBaseQuery): Promise<Property[]>;

async function getProperty(
	options: PropertyPageQuery,
): Promise<EntityPageResult<Property>>;

async function getProperty(
	options: PropertyQuery = {},
): Promise<Property[] | EntityPageResult<Property>> {
	const response = await apiClient.query<Property>({
		url: "property",
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

export { getProperty };
