import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { InspectorForm } from "./tasks/InspectorForm";
import { ImamSamplingForm } from "./tasks/SamplingForm";

export function getImamSamplingTaskDetails(task: Task): TaskDetailsReturn {
  switch (task.key) {
    case "ImamSamplingForm":
      return ImamSamplingForm;
    case "InspectorForm":
      return InspectorForm;
    default:
      throw new Error();
  }
}
