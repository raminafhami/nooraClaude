import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Task } from "../models/Task";
import { TaskApi } from "../models/TaskApi";
import { TaskBaseQuery, TaskPageQuery, TaskQuery } from "../models/TaskQuery";
import { parseTask } from "../utils/parseTask";

async function getMyDoneTasks(options?: TaskBaseQuery): Promise<Task[]>;

async function getMyDoneTasks(
  options: TaskPageQuery,
): Promise<EntityPageResult<Task>>;

async function getMyDoneTasks(
  options: TaskQuery = {},
): Promise<Task[] | EntityPageResult<Task>> {
  const response = await apiClient.query<TaskApi>({
    url: "my-tasks/done",
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

export { getMyDoneTasks };
