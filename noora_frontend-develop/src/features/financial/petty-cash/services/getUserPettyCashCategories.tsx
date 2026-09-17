import apiClient from "@/api/client";

import { FinancialCategory } from "../../financial-category/models/FinancialCategory";

type GetUserPettyCashCategoriesReturn = FinancialCategory & {
	amount: number;
	remain: number;
	dateTo: string;
	dateFrom: string;
};

async function getUserPettyCashCategories(): Promise<
	GetUserPettyCashCategoriesReturn[]
> {
	const response = await apiClient.get<GetUserPettyCashCategoriesReturn[]>({
		url: "petty-cash/my-petty-cash-categories",
	});

	return response.result;
}

export { getUserPettyCashCategories };
