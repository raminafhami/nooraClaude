import { Currency } from "@/enums/Currency";
import { Cost } from "@/financial/costs/models/Cost";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { UserLookup } from "@/identity/users/models/UserLookup";

import { IncomeStatus } from "../enums/IncomeStatus";
import { IncomeType } from "../enums/IncomeType";
import { IncomeUnit } from "../enums/IncomeUnit";

type Income = {
	id: string;
	instanceId: string;
	caseNo: string;
	costId: string | null;
	categoryId: string;
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
	createdById: string;
	updatedAt: string;
	updatedById: string;
	lock?: number | null | undefined;

	cost?: Cost | null;
	category?: FinancialCategory;
	createdBy?: UserLookup;
	updatedBy?: UserLookup;
};

export type { Income };
