import apiClient from "@/api/client";

import { Form } from "../models/Form";

async function archiveForm(formId: string): Promise<Form> {
	const response = await apiClient.post<Form>({
		url: `form-builder/forms/${formId}/archive`,
	});

	return response.result;
}

export { archiveForm };
