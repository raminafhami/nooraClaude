import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { UserApi } from "@/identity/users/models/User";
import { UserLookupApi } from "@/identity/users/models/UserLookup";

type PettyCashApi = {
	id: string;
	title: string;
	userId: UserApi | string;
	amount: number;
	remain: number;
	files: string[];
	categoryIds: FinancialCategory[] | string[];
	description: string;
	bankCardNumber: string;
	bankShebaNumber: string;
	createdBy?: UserLookupApi | string;
	updatedBy?: UserLookupApi | string;
};

export type { PettyCashApi };
