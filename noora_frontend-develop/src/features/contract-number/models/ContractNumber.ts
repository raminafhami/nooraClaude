import { BranchApi } from "@/branches/models/Branch";
import { BuyerApi } from "@/buyers/models/BuyerApi";
import { UserApi } from "@/identity/users/models/User";
import { UserLookupApi } from "@/identity/users/models/UserLookup";

type ContractNumber = {
	id: string;
	cn: string;
	title: string;
	branchId: BranchApi | string;
	buyerId: BuyerApi | string;
	customerId?: UserLookupApi | string;
	proforma?: string;
	isDeleted: boolean;
	createdBy: UserApi | string;
	createdAt: string;
	updatedAt: string;
};

export type { ContractNumber };
