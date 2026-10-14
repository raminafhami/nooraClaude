import apiClient from "@/api/client";

import { FormAssignment } from "../models/FormAssignment";

async function deactivateFormAssignment(
	assignmentId: string,
): Promise<FormAssignment> {
	const response = await apiClient.post<FormAssignment>({
		url: `form-builder/assignments/${assignmentId}/deactivate`,
	});

	return response.result;
}

export { deactivateFormAssignment };
