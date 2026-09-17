import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

function renderTaskOfInvoiceCancellation(task: Task): TaskDetailsReturn {
	const details = require(`../tasks/${task.key}`).default;

	if (!details) {
		throw new Error();
	}

	return details;
}

export { renderTaskOfInvoiceCancellation };
