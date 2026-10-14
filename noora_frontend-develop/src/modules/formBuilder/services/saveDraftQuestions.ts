import apiClient from "@/api/client";

import { FormQuestion } from "../models/FormQuestion";
import { FormVersion } from "../models/FormVersion";

async function saveDraftQuestions(
	formId: string,
	questions: FormQuestion[],
): Promise<FormVersion> {
	const response = await apiClient.put<FormVersion>({
		url: `form-builder/forms/${formId}/draft-version`,
		body: { questions },
	});

	return response.result;
}

export { saveDraftQuestions };
