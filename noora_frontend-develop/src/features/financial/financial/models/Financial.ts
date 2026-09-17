import { Cost } from "@/financial/costs/models/Cost";

import { Income } from "../../incomes/models/Income";
import { FinancialType } from "../enums/FinancialType";

type FinancialBase = {
	type: FinancialType;
};

type FinancialCost = FinancialBase & {
	type: FinancialType.Cost;
	item: Cost;
};

type FinancialIncome = FinancialBase & {
	type: FinancialType.Income;
	item: Income;
};

type Financial = FinancialCost | FinancialIncome;

export type { FinancialCost, FinancialIncome, Financial };
