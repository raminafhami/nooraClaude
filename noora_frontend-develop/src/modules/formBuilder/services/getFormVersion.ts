import apiClient from "@/api/client";

import { FormVersion } from "../models/FormVersion";

async function getFormVersion(
	formId: string,
	versionId: string,
): Promise<FormVersion> {
	const response = await apiClient.get<FormVersion>({
		url: `form-builder/forms/${formId}/versions/${versionId}`,
	});

	return response.result;
}

export { getFormVersion };
