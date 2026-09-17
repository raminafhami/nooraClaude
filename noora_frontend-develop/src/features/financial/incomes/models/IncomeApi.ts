import { Currency } from "@/enums/Currency";
import { CostApi } from "@/financial/costs/models/CostApi";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { UserLookupApi } from "@/identity/users/models/UserLookup";

import { IncomeStatus } from "../enums/IncomeStatus";
import { IncomeType } from "../enums/IncomeType";
import { IncomeUnit } from "../enums/IncomeUnit";

type IncomeApi = {
	id: string;
	instanceId: string;
	caseNo: string;
	costId: string | CostApi | null;
	categoryId: FinancialCategory | string;
	title: string;
	description: string;
	amount: number;
	currency: Currency;
	currencyRate: number;
	quantity: number;
	unit: IncomeUnit;
	discount: number;
	additionalFee: number;
	tax: number;
	total: number;
	status: IncomeStatus;
	type: IncomeType;
	isDeleted: boolean;
	createdAt: string;
	createdBy: UserLookupApi | string;
	updatedAt: string;
	updatedBy: UserLookupApi | string;
	lock?: number | null | undefined;
};

export type { IncomeApi };
