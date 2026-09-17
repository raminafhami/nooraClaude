import { BranchApi } from "@/branches/models/Branch";
import { IndustryApi } from "@/industries/models/IndustryApi";

import { BuyerReferralSource } from "../enums/BuyerReferralSource";
import { BuyerType } from "../enums/BuyerType";

type BuyerApi = {
	id: string;
	branches: string[] | BranchApi[];
	name: string;
	type: BuyerType;
	userId: string | null;
	nationalCode: string;
	postalCode: string;
	contactNo: string[];
	address: string;

	industryId?: string | IndustryApi | null;
	subIndustryId?: string | IndustryApi | null;
	referralSource?: BuyerReferralSource | null;

	metadata: {
		nameEn: string;
		email: string | null;
		registrationNo?: string;
		sepidarId?: string | null;
	};

	isDeleted?: boolean;
};

export type { BuyerApi };
