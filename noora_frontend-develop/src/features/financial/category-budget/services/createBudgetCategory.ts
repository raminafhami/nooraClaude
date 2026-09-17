import apiClient from "@/api/client";

type CreateBudgetCategoryDto = {
	name: string;
	categoryId: string;
	amount: number;
	dateFrom: string;
	dateTo: string;
};

type CreateBudgetCategoryApi = CreateBudgetCategoryDto;
async function createBudgetCategory(
	details: CreateBudgetCategoryDto,
): Promise<any> {
	const data: CreateBudgetCategoryApi = {
		name: details.name.trim(),
		categoryId: details.categoryId,
		amount: details.amount,
		dateFrom: details.dateFrom,
		dateTo: details.dateTo,
	};

	const response = await apiClient.post<CreateBudgetCategoryApi>({
		url: "category-budget",
		body: data,
	});

	return response.result;
}

export { createBudgetCategory };
