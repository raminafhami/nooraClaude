import apiClient from "@/api/client";

import { FinancialCategory } from "../models/FinancialCategory";

type CreateFinancialCategoryDto = {
	type: string;
	title: string;
	code: string;
	key?: string | null;
	parentId?: string | null;
};

type CreateFinancialCategoryApi = CreateFinancialCategoryDto;

async function createFinancialCategory(
	details: CreateFinancialCategoryDto,
): Promise<FinancialCategory> {
	const data: CreateFinancialCategoryApi = {
		type: details.type,
		title: details.title.trim(),
		code: details.code.trim(),
		parentId: details.parentId || undefined,
		key: details.key?.trim() || undefined,
	};

	const response = await apiClient.post<FinancialCategory>({
		url: "category",
		body: data,
	});

	return response.result;
}

export { createFinancialCategory };
