import apiClient from "@/api/client";

import { Form } from "../models/Form";

async function createNewFormVersion(formId: string): Promise<Form> {
	const response = await apiClient.post<Form>({
		url: `form-builder/forms/${formId}/new-version`,
	});

	return response.result;
}

export { createNewFormVersion };
