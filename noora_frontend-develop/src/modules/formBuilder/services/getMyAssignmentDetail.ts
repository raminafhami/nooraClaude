import apiClient from "@/api/client";

import { Form } from "../models/Form";
import { FormAssignment } from "../models/FormAssignment";
import { FormOccurrence } from "../models/FormOccurrence";

type MyAssignmentDetail = {
	assignment: FormAssignment;
	form: Form;
	occurrences: FormOccurrence[];
};

async function getMyAssignmentDetail(
	assignmentId: string,
): Promise<MyAssignmentDetail> {
	const response = await apiClient.get<MyAssignmentDetail>({
		url: `form-builder/assignments/${assignmentId}/detail`,
	});

	return response.result;
}

export { getMyAssignmentDetail };
export type { MyAssignmentDetail };
