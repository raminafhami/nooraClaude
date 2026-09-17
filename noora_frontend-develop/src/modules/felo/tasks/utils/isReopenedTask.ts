import { Task } from "../models/Task";

interface TaskLike extends Pick<Task, "completedAt"> {}

function isReopenedTask(task: TaskLike): boolean {
  return Boolean(task.completedAt);
}

export { isReopenedTask };
