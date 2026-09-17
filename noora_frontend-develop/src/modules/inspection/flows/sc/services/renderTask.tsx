import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { InformationForm } from "../tasks/InformationForm/PhaseEntry";
import { InformationReview } from "../tasks/InformationReview/PhaseEntry";
import { InitialForm } from "../tasks/InitialForm";
import { ReportForm } from "../tasks/ReportForm/PhaseEntry";

export function renderTaskOfInspectionSC(task: Task): TaskDetailsReturn {
	switch (task.key) {
		case "InitialForm":
			return InitialForm;
		case "InformationForm":
			return InformationForm;
		case "InformationReview":
			return InformationReview;
		case "ReportForm":
			return ReportForm;
		default:
			throw new Error();
	}
}
