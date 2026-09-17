import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Activity } from "../models/Activity";
import {
	ActivityBaseQuery,
	ActivityPageQuery,
	ActivityQuery,
} from "../models/ActivityQuery";

async function getActivities(options?: ActivityBaseQuery): Promise<Activity[]>;

async function getActivities(
	options: ActivityPageQuery,
): Promise<EntityPageResult<Activity>>;

async function getActivities(
	options: ActivityQuery = {},
): Promise<Activity[] | EntityPageResult<Activity>> {
	const response = await apiClient.query<Activity>({
		url: "project-task",
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

export { getActivities };
