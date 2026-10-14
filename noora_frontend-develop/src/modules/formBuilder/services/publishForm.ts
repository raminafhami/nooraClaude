import apiClient from "@/api/client";

import { Form } from "../models/Form";

async function publishForm(formId: string): Promise<Form> {
	const response = await apiClient.post<Form>({
		url: `form-builder/forms/${formId}/publish`,
	});

	return response.result;
}

export { publishForm };
