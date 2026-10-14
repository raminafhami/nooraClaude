import apiClient from "@/api/client";

import { FormCategory } from "../models/FormCategory";

async function createFormCategory(title: string): Promise<FormCategory> {
	const response = await apiClient.post<FormCategory>({
		url: "form-builder/categories",
		body: { title: title.trim() },
	});

	return response.result;
}

export { createFormCategory };
