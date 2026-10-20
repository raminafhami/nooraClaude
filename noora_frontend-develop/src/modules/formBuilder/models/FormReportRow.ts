import { FormAssignmentFrequency } from "../enums/FormAssignmentFrequency";
import { FormOccurrenceStatus } from "../enums/FormOccurrenceStatus";

type FormReportRow = {
	id: string;
	assignmentId: string;
	formId: string;
	userId: string;
	versionId: string;
	frequency: FormAssignmentFrequency;
	periodKey?: string | null;
	dueDate?: string | null;
	status: FormOccurrenceStatus;
	createdAt: string;
	form: {
		title: string;
		code: string;
		category?: { title: string };
	};
	user?: { id: string; name: string; lastname: string };
	version?: { versionNo: number };
	// The listing omits answers and the signature; the detail endpoint has them.
	response?: {
		submittedAt?: string | null;
		completerName?: string | null;
	};
};

type FormReportMetrics = {
	expected: number;
	completed: number;
	incomplete: number;
	overdue: number;
	onTimeCompletionPercentage: number;
};

export type { FormReportRow, FormReportMetrics };
