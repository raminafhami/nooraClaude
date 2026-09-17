import { z } from "zod";

import { Buyer } from "@/buyers/models/Buyer";
import { CaseType } from "@/inspection/models/CaseType";

import { Ids } from "../../data";

export const schema = z.object({
	[Ids.branchId]: z.string(),
	[Ids.buyerId]: z.string(),
	[Ids.buyerName]: z.string(),
	[Ids.buyerAddress]: z.string(),
	[Ids.buyerData]: z.custom<Buyer>(),
	[Ids.date]: z.string(),
	[Ids.pageNo]: z.string(),
	[Ids.place]: z.string(),
	[Ids.price]: z.string(),
	[Ids.samplerId]: z.string(),
	[Ids.samplerName]: z.string(),
	[Ids.samplerSignature]: z.string(),
	[Ids.systemBarcode]: z.string(),
	[Ids.type]: z.string(),
	[Ids.caseType]: z.custom<CaseType>(),

	[Ids.dischargerName]: z.string().optional(),
	[Ids.dischargerPhoneNo]: z.string().optional(),
});
