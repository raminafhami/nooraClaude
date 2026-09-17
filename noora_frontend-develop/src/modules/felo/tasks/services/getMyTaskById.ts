import apiClient from "@/api/client";

import { Task } from "../models/Task";
import { TaskApi } from "../models/TaskApi";
import { parseTask } from "../utils/parseTask";

async function getMyTaskById(
  id: string,
  paramateres?: string[],
): Promise<Task> {
  const response = await apiClient.get<TaskApi>({
    url: `my-tasks/${id}?props=${paramateres?.join(",") || "ownerGroup"}`,
  });

  return parseTask(response.result);
}

export { getMyTaskById };
