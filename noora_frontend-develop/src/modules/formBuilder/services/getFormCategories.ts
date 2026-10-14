import apiClient from "@/api/client";

import { FormCategory } from "../models/FormCategory";

async function getFormCategories(): Promise<FormCategory[]> {
	const response = await apiClient.get<FormCategory[]>({
		url: "form-builder/categories",
	});

	return response.result;
}

export { getFormCategories };
