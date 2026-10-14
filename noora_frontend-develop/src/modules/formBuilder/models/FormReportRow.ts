import { FormAssignmentFrequency } from "../enums/FormAssignmentFrequency";
import { FormOccurrenceStatus } from "../enums/FormOccurrenceStatus";

type FormReportRow = {
	id: string;
	formId: string;
	userId: string;
	versionId: string;
	frequency: FormAssignmentFrequency;
	periodKey?: string | null;
	dueDate?: string | null;
	status: FormOccurrenceStatus;
	form: {
		title: string;
		code: string;
		category?: { title: string };
	};
	user?: { id: string; name: string; lastname: string };
	version?: { versionNo: number };
	response?: {
		answers: Record<string, unknown>;
		submittedAt?: string | null;
		completerName?: string | null;
		signatureBase64?: string | null;
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
