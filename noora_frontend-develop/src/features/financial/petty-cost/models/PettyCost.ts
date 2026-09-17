import { Currency } from "@/enums/Currency";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { UserApi } from "@/identity/users/models/User";

type PettyCostApi = {
	id: string;
	userId: UserApi | string;
	type: string;
	categoryBudgetId: string;
	categoryId?: FinancialCategory | string | null;
	pettyCashIds: string[];
	amount: number;
	currency: Currency;
	currencyRate: number;
	vat: number;
	total: number;
	spentDate: string;
	description: string;
	status: string;
	sellerNationalCode?: string;
	invoiceNumber?: string;
	files: string[];
	createdAt: string;
	updatedAt: string;
};

export type { PettyCostApi };
