import { FinancialCategoryType } from "../enums/FinancialCategoryType";

type FinancialCategory = {
	id: string;
	title: string;
	type: FinancialCategoryType;
	code: string;
	key?: string;
	isDeleted: boolean;
	parentId?: FinancialCategory | string | null;
};

export type { FinancialCategory };
