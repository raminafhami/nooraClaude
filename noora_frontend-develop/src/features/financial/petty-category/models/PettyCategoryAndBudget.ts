import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";

type PettyCategoryAndBudget = FinancialCategory & {
	budgetName: string;
	amount: number;
	remain: number;
	dateTo: string;
	dateFrom: string;
};

export type { PettyCategoryAndBudget };
