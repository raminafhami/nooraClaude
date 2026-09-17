import { Task } from "../models/Task";
import { getMyTasks } from "./getMyTasks";

async function getMyNextTask(instanceId: string): Promise<Task | undefined> {
  let tasks = await getMyTasks({
    filters: { processInstanceId: instanceId },
  });

  return tasks.at(0);
}

export { getMyNextTask };
