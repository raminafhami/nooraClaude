import apiClient from "@/api/client";

import { DispatcherCategory } from "../models/DispatcherCategory";

type CreateDispatcherCategoryDto = {
	type: string;
	domainCode: string;
	inspectionDomain: string;
	include: string[];
	exclude: string[];
};

type CreateDispatcherCategoryApi = CreateDispatcherCategoryDto;

async function createDispatcherCategory(
	details: CreateDispatcherCategoryDto,
): Promise<DispatcherCategory> {
	const data: CreateDispatcherCategoryApi = {
		...details,
	};

	const response = await apiClient.post<DispatcherCategory>({
		url: "dispatcher-category",
		body: data,
	});

	return response.result;
}

export { createDispatcherCategory };
