import apiClient from "@/api/client";

import { FormAssignmentFrequency } from "../enums/FormAssignmentFrequency";

type CreateFormAssignmentsInput = {
	userIds: string[];
	frequency: FormAssignmentFrequency;
	startDate: string;
	dueDate?: string;
	endDate?: string;
};

type AssignmentResult = {
	userId: string;
	success: boolean;
	assignmentId?: string;
	message?: string;
};

async function createFormAssignments(
	formId: string,
	input: CreateFormAssignmentsInput,
): Promise<AssignmentResult[]> {
	const response = await apiClient.post<AssignmentResult[]>({
		url: `form-builder/forms/${formId}/assignments`,
		body: input,
	});

	return response.result;
}

export { createFormAssignments };
export type { CreateFormAssignmentsInput, AssignmentResult };
