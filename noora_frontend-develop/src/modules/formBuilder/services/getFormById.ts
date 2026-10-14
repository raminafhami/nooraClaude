import apiClient from "@/api/client";

import { Form } from "../models/Form";

async function getFormById(id: string): Promise<Form> {
	const response = await apiClient.get<Form>({
		url: `form-builder/forms/${id}`,
	});

	return response.result;
}

export { getFormById };
