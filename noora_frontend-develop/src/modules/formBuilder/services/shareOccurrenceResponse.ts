import apiClient from "@/api/client";

import { FormShare } from "../models/FormShare";

async function shareOccurrenceResponse(
	occurrenceId: string,
	recipientUserId: string,
	message?: string,
): Promise<FormShare> {
	const response = await apiClient.post<FormShare>({
		url: `form-builder/occurrences/${occurrenceId}/share`,
		body: { recipientUserId, message },
	});

	return response.result;
}

export { shareOccurrenceResponse };
