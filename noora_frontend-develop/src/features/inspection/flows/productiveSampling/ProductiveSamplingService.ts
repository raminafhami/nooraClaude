import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { InspectorForm } from "./tasks/InspectorForm";
import { ProductiveSamplingForm } from "./tasks/SamplingForm";

export function getProductiveSamplingTaskDetails(
	task: Task,
): TaskDetailsReturn {
	switch (task.key) {
		case "ProductiveSamplingForm":
		case "InitialForm":
			return ProductiveSamplingForm;
		case "InspectorForm":
		case "SamplerForm":
			return InspectorForm;
		default:
			throw new Error();
	}
}
