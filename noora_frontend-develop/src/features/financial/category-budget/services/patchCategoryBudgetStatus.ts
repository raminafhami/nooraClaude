import apiClient from "@/api/client";

type UpdateFinancialCategoryDto = {
	active: boolean;
};

async function patchCategoryBudgetStatus(
	id: string,
	details: UpdateFinancialCategoryDto,
): Promise<void> {
	await apiClient.patch({
		url: `category-budget/status/${id}?active=${details.active}`,
	});
}

export { patchCategoryBudgetStatus };
