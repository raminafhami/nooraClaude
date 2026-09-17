import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { TaskStatus } from "../enums/TaskStatus";
import { Task } from "../models/Task";
import { TaskApi } from "../models/TaskApi";
import { TaskBaseQuery, TaskPageQuery, TaskQuery } from "../models/TaskQuery";
import { parseTask } from "../utils/parseTask";

async function getMyTasksByStatus(
	status: TaskStatus,
	options?: TaskBaseQuery,
): Promise<Task[]>;

async function getMyTasksByStatus(
	status: TaskStatus,
	options: TaskPageQuery,
): Promise<EntityPageResult<Task>>;

async function getMyTasksByStatus(
	status: TaskStatus,
	options: TaskQuery = {},
): Promise<Task[] | EntityPageResult<Task>> {
	const response = await apiClient.query<TaskApi>({
		url: `my-tasks-status/${status}`,
		queryOptions: options,
	});

	if (!options.pagination) {
		return parseTask(response.result.data);
	}

	return {
		items: parseTask(response.result.data),
		page: options.pagination.page,
		pageSize: options.pagination.pageSize,
		total: response.result.count,
	};
}

export { getMyTasksByStatus };
