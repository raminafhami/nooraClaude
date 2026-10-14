import apiClient from "@/api/client";

import { FormResponse } from "../models/FormResponse";

async function getOccurrenceResponse(
	occurrenceId: string,
): Promise<FormResponse | null> {
	const response = await apiClient.get<FormResponse | null>({
		url: `form-builder/occurrences/${occurrenceId}/response`,
	});

	return response.result;
}

export { getOccurrenceResponse };
