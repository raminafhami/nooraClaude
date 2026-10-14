import apiClient from "@/api/client";

import { FormResponse } from "../models/FormResponse";

async function finalizeOccurrenceResponse(
	occurrenceId: string,
): Promise<FormResponse> {
	const response = await apiClient.post<FormResponse>({
		url: `form-builder/occurrences/${occurrenceId}/finalize`,
		body: { confirm: true },
	});

	return response.result;
}

export { finalizeOccurrenceResponse };
