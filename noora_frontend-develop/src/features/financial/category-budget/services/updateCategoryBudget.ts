import apiClient from "@/api/client";

type UpdateCategoryBudgetDto = Partial<{
	name: string;
	amount: number;
}>;

type UpdateCategoryBudgetApi = UpdateCategoryBudgetDto;

async function updateCategoryBudget(
	id: string,
	details: UpdateCategoryBudgetDto,
): Promise<any> {
	const data: UpdateCategoryBudgetApi = {
		name: details.name?.trim(),
		amount: details.amount,
	};

	const response = await apiClient.put({
		url: `category-budget/${id}`,
		body: data,
	});

	return response.result;
}

export { updateCategoryBudget };
