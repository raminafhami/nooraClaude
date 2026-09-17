import apiClient from "@/api/client";

import { FinancialCategory } from "../models/FinancialCategory";

type UpdateFinancialCategoryDto = Partial<{
	title: string;
	code: string;
}>;

type UpdateFinancialCategoryApi = UpdateFinancialCategoryDto;

async function updateFinancialCategory(
	id: string,
	details: UpdateFinancialCategoryDto,
): Promise<FinancialCategory> {
	const data: UpdateFinancialCategoryApi = {
		title: details.title?.trim(),
		code: details.code?.trim(),
	};

	const response = await apiClient.patch<FinancialCategory>({
		url: `category/${id}`,
		body: data,
	});

	return response.result;
}

export { updateFinancialCategory };
