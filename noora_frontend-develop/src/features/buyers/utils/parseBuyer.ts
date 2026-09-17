import { BranchApi } from "@/branches/models/Branch";
import { parseBranch } from "@/branches/utils/parseBranch";
import { parseIndustry } from "@/industries/utils/parseIndustry";

import { BuyerType } from "../enums/BuyerType";
import { Buyer } from "../models/Buyer";
import { BuyerApi } from "../models/BuyerApi";

function parseBuyer(from: BuyerApi): Buyer;

function parseBuyer(from: BuyerApi[]): Buyer[];

function parseBuyer(from: BuyerApi | BuyerApi[]): Buyer | Buyer[] {
	if (Array.isArray(from)) {
		return from.map((x) => parseBuyer(x));
	}

	let result: Buyer = {
		id: from.id,
		branchIds: from.branches?.length
			? typeof from.branches[0] === "string"
				? (from.branches as string[])
				: (from.branches as BranchApi[]).map((x) => x.id)
			: [],
		branches: from.branches?.length
			? typeof from.branches[0] === "object"
				? parseBranch(from.branches as BranchApi[])
				: undefined
			: [],
		type: from.type,
		name: from.name?.trim() ?? "",
		nameEn: from.metadata?.nameEn?.trim() ?? "",
		nationalCode: from.nationalCode,
		registrationNo:
			from.type === BuyerType.Legal
				? (from.metadata?.registrationNo ?? "")
				: undefined,
		phoneNo: ((no: string[]) => {
			if (no.length === 1) {
				return no[0];
			}

			return "";
		})(from.contactNo.filter((x) => x.startsWith("p")).map((x) => x.slice(2))),
		faxNo: ((no: string[]) => no.at(0) || null)(
			from.contactNo.filter((x) => x.startsWith("f")).map((x) => x.slice(2)),
		),
		email: from.metadata?.email ?? null,
		postalCode: from.postalCode,
		address: from.address,
		sepidarId: from.metadata?.sepidarId || null,
		industryId: from.industryId
			? typeof from.industryId === "string"
				? from.industryId
				: from.industryId.id
			: null,
		subIndustryId: from.subIndustryId
			? typeof from.subIndustryId === "string"
				? from.subIndustryId
				: from.subIndustryId.id
			: null,
		referralSource: from.referralSource ?? null,

		isDeleted: from.isDeleted ?? false,

		industry: from.industryId
			? typeof from.industryId === "object"
				? parseIndustry(from.industryId)
				: undefined
			: null,
		subIndustry: from.subIndustryId
			? typeof from.subIndustryId === "object"
				? parseIndustry(from.subIndustryId)
				: undefined
			: null,
	};

	return result;
}

export { parseBuyer };
