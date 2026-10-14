import apiClient from "@/api/client";

import { FormResponse } from "../models/FormResponse";

async function saveOccurrenceAnswers(
	occurrenceId: string,
	answers: Record<string, unknown>,
	revision: number,
): Promise<FormResponse> {
	const response = await apiClient.put<FormResponse>({
		url: `form-builder/occurrences/${occurrenceId}/response`,
		body: { answers, revision },
	});

	return response.result;
}

export { saveOccurrenceAnswers };
