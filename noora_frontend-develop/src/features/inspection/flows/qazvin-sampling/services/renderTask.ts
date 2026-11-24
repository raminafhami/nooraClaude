import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { QazvinInspectorForm } from "../tasks/InspectorForm";
import { LegacyQazvinSamplingForm } from "../tasks/LegacySamplingForm";
import { QazvinSamplingForm } from "../tasks/SamplingForm";

export function renderTaskOfQazvinSampling(task: Task): TaskDetailsReturn {
	switch (task.key) {
		case "QazvinSamplingForm":
			return task.instanceVersion > 1 ? QazvinSamplingForm : LegacyQazvinSamplingForm;
		case "InspectorForm":
			return QazvinInspectorForm;
		default:
			throw new Error();
	}
}
