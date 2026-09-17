import apiClient from "@/api/client";

import { DispatcherCategory } from "../models/DispatcherCategory";

type UpdateDispatcherCategoryDto = Partial<{
	type: string;
	domainCode: string;
	inspectionDomain: string;
	include: string[];
	exclude: string[];
}>;

type UpdateDispatcherCategoryApi = UpdateDispatcherCategoryDto;

async function updateDispatcherCategory(
	id: string,
	details: UpdateDispatcherCategoryDto,
): Promise<DispatcherCategory> {
	const data: UpdateDispatcherCategoryApi = {
		...details,
	};

	const response = await apiClient.put<DispatcherCategory>({
		url: `dispatcher-category/${id}`,
		body: data,
	});

	return response.result;
}

export { updateDispatcherCategory };
