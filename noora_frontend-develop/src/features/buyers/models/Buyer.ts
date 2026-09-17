import { Branch } from "@/branches/models/Branch";
import { Industry } from "@/industries/models/Industry";

import { BuyerReferralSource } from "../enums/BuyerReferralSource";
import { BuyerType } from "../enums/BuyerType";

type Buyer = {
	id: string;
	branchIds: string[];
	branches?: Branch[];
	type: BuyerType;
	name: string;
	nameEn: string;
	nationalCode: string;
	registrationNo?: string;
	postalCode: string;
	phoneNo: string;
	faxNo: string | null;
	email: string | null;
	address: string;
	sepidarId: string | null;

	industryId: string | null;
	subIndustryId: string | null;
	referralSource: BuyerReferralSource | null;

	isDeleted: boolean;

	industry?: Industry | null;
	subIndustry?: Industry | null;
};

export type { Buyer };
