import apiClient from "@/api/client";

import { FormAssignment } from "../models/FormAssignment";

async function getFormAssignments(formId: string): Promise<FormAssignment[]> {
	const response = await apiClient.get<FormAssignment[]>({
		url: `form-builder/forms/${formId}/assignments`,
	});

	return response.result;
}

export { getFormAssignments };
