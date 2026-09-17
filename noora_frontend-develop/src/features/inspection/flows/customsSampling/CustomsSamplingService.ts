import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { InspectorForm } from "./tasks/InspectorForm";
import { CustomsSamplingForm } from "./tasks/SamplingForm";

export function getCustomsSamplingTaskDetails(task: Task): TaskDetailsReturn {
  switch (task.key) {
    case "CustomsSamplingForm":
      return CustomsSamplingForm;
    case "InspectorForm":
      return InspectorForm;
    default:
      throw new Error();
  }
}
