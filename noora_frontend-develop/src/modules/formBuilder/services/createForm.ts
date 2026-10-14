import apiClient from "@/api/client";

import { Form } from "../models/Form";

type CreateFormInput = {
	title: string;
	categoryId: string;
	description?: string;
};

async function createForm(input: CreateFormInput): Promise<Form> {
	const response = await apiClient.post<Form>({
		url: "form-builder/forms",
		body: input,
	});

	return response.result;
}

export { createForm };
export type { CreateFormInput };
