import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { InspectorForm } from "./tasks/InspectorForm";
import { BoushehrSamplingForm } from "./tasks/SamplingForm";

export function getBoushehrSamplingTaskDetails(task: Task): TaskDetailsReturn {
  switch (task.key) {
    case "BoushehrSamplingForm":
      return BoushehrSamplingForm;
    case "InspectorForm":
      return InspectorForm;
    default:
      throw new Error();
  }
}
