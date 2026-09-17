import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { ProjectTask } from "../models/ProjectTask";
import {
	ProjectTaskBaseQuery,
	ProjectTaskPageQuery,
	ProjectTaskQuery,
} from "../models/ProjectTaskQuery";

async function getProjectTasks(
	options?: ProjectTaskBaseQuery,
): Promise<ProjectTask[]>;

async function getProjectTasks(
	options: ProjectTaskPageQuery,
): Promise<EntityPageResult<ProjectTask>>;

async function getProjectTasks(
	options: ProjectTaskQuery = {},
): Promise<ProjectTask[] | EntityPageResult<ProjectTask>> {
	const response = await apiClient.query<ProjectTask>({
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

export { getProjectTasks };
