import apiClient from "@/api/client";

import { DispatcherCategory } from "../models/DispatcherCategory";

async function getDispatcherCategoryById(
	id: string,
): Promise<DispatcherCategory> {
	const response = await apiClient.get<DispatcherCategory>({
		url: `dispatcher-category/${id}`,
	});

	return response.result;
}

export { getDispatcherCategoryById };
