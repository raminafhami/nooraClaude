import apiClient from "@/api/client";

import { Form } from "../models/Form";

type UpdateFormInput = Partial<{
	title: string;
	categoryId: string;
	description: string;
}>;

async function updateForm(id: string, input: UpdateFormInput): Promise<Form> {
	const response = await apiClient.put<Form>({
		url: `form-builder/forms/${id}`,
		body: input,
	});

	return response.result;
}

export { updateForm };
export type { UpdateFormInput };
