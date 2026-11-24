import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { QazvinSamplingForm } from "../tasks/SamplingForm";

export function renderTaskOfQazvinSampling(task: Task): TaskDetailsReturn {
	switch (task.key) {
		case "QazvinSamplingForm":
			return QazvinSamplingForm;
		default:
			throw new Error();
	}
}
