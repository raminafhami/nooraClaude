import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

export function renderTaskOfPersonnelContract(task: Task): TaskDetailsReturn {
  const details = require(`../tasks/${task.key}/TaskEntry`)[task.key];

  if (!details) {
    throw new Error();
  }

  return details;
}
