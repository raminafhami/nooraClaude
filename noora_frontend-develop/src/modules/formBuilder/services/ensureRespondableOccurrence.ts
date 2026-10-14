import apiClient from "@/api/client";

import { FormOccurrence } from "../models/FormOccurrence";

async function ensureRespondableOccurrence(
	assignmentId: string,
): Promise<FormOccurrence> {
	const response = await apiClient.post<FormOccurrence>({
		url: `form-builder/assignments/${assignmentId}/occurrence`,
	});

	return response.result;
}

export { ensureRespondableOccurrence };
