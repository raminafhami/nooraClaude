import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";

import { CertificateForm } from "../tasks/CertificateForm/PhaseEntry";
import { CertificateIssuance } from "../tasks/CertificateIssuance/PhaseEntry";
import { CertificatePreview } from "../tasks/CertificatePreview/PhaseEntry";
import { HistoryReview } from "../tasks/HistoryReview/PhaseEntry";
import { InformationForm } from "../tasks/InformationForm/PhaseEntry";
import { InformationReview } from "../tasks/InformationReview/PhaseEntry";
import { InitialForm } from "../tasks/InitialForm";

export function renderTaskOfInspectionLC(task: Task): TaskDetailsReturn {
	switch (task.key) {
		case "InitialForm":
			return InitialForm;
		case "InformationForm":
			return InformationForm;
		case "HistoryReview":
			return HistoryReview;
		case "InformationReview":
			return InformationReview;
		case "CertificateForm":
			return CertificateForm;
		case "CertificatePreview":
			return CertificatePreview;
		case "CertificateIssuance":
			return CertificateIssuance;
		default:
			throw new Error();
	}
}
