import { FormAssignmentFrequency } from "../enums/FormAssignmentFrequency";

type FormAssignment = {
	id: string;
	formId: string;
	userId: string;
	user?: { id: string; name: string; lastname: string };
	assignedBy: string;
	frequency: FormAssignmentFrequency;
	startDate: string;
	dueDate?: string | null;
	endDate?: string | null;
	notifyEnabled: boolean;
	isActive: boolean;
	createdAt: string;
};

export type { FormAssignment };
