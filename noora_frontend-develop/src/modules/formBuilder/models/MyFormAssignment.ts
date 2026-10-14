import { FormAssignmentFrequency } from "../enums/FormAssignmentFrequency";
import { FormOccurrenceStatus } from "../enums/FormOccurrenceStatus";
import { FormCategory } from "./FormCategory";

type MyFormAssignment = {
	assignmentId: string;
	frequency: FormAssignmentFrequency;
	form: {
		id: string;
		title: string;
		code: string;
		category?: FormCategory;
	};
	currentOccurrence: {
		id: string;
		status: FormOccurrenceStatus;
		dueDate?: string | null;
		isOverdue: boolean;
	} | null;
};

export type { MyFormAssignment };
