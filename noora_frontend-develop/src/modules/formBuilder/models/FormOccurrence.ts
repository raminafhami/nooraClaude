import { FormAssignmentFrequency } from "../enums/FormAssignmentFrequency";
import { FormOccurrenceStatus } from "../enums/FormOccurrenceStatus";

type FormOccurrence = {
	id: string;
	assignmentId: string;
	formId: string;
	userId: string;
	versionId: string;
	frequency: FormAssignmentFrequency;
	periodKey?: string | null;
	periodStart?: string | null;
	periodEnd?: string | null;
	dueDate?: string | null;
	status: FormOccurrenceStatus;
	createdAt: string;
};

export type { FormOccurrence };
