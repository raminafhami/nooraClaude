import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { InspectorProcess } from "./tasks/InspectorProcess/PhaseEntry";
import { InspectorSelection } from "./tasks/InspectorSelection/PhaseEntry";
import { InspectionValidate } from "./tasks/InspectorValidate";

export function getInspectionReport(task: Task): TaskDetailsReturn {
  switch (task.key) {
    case "InspectorSelection":
      return InspectorSelection;
    case "InspectorProcess":
      return InspectorProcess;
    case "InspectionValidate":
      return InspectionValidate;
    // case "PaymentOrderCompletion":
    //   return PaymentCompletion;
    default:
      throw new Error();
  }
}
