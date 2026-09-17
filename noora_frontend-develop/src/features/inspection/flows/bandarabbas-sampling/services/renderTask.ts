import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { InspectorForm } from "../tasks/InspectorForm";
import { SamplingForm } from "../tasks/SamplingForm";

export function renderTaskOfBandarAbbasSampling(task: Task): TaskDetailsReturn {
	const details = (() => {
		switch (task.key) {
			case "SamplingForm":
				return SamplingForm;
			case "InspectorForm":
				return InspectorForm;
			default:
				throw new Error();
		}
	})();

	if (!details) {
		throw new Error();
	}

	return details;
}
