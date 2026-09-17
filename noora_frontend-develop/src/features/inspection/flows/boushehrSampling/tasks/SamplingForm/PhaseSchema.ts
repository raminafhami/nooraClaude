import { z } from "zod";

import { CaseType } from "@/inspection/models/CaseType";

import { Ids } from "../../data";

export const schema = z.object({
	[Ids.caseType]: z.custom<CaseType>(),
	[Ids.pageNo]: z.string(),
	[Ids.place]: z.string(),
	[Ids.title]: z.string(),
	[Ids.buyerId]: z.string(),
	[Ids.buyerName]: z.string(),
	[Ids.buyerAddress]: z.string(),
	[Ids.nationalNo]: z.string(),
	[Ids.economicalNo]: z.string(),
	[Ids.cottageDate]: z.string(),
	[Ids.cottageNo]: z.string(),
	[Ids.receipt]: z.string(),
	[Ids.coordinator]: z.string(),
	[Ids.productOwner]: z.string(),
	[Ids.samplerName]: z.string(),
	[Ids.samplerSignature]: z.string(),
	[Ids.branchId]: z.string(),
	[Ids.samplerId]: z.string(),
	[Ids.sellerName]: z.string(),

	[Ids.sealId]: z.string(),
	[Ids.bigLabelId]: z.string(),
	[Ids.smallLabelId]: z.string(),

	[Ids.productsData]: z.array(
		z.object({
			[Ids.manufactureCountry]: z.string(),
			[Ids.standardMethod]: z.string(),
			[Ids.productName]: z.string(),
			[Ids.model]: z.string(),
			[Ids.brand]: z.string(),
			[Ids.sampleAmount]: z.string(),
			[Ids.unit]: z.string(),
			[Ids.packingType]: z.string(),
			[Ids.sealNo]: z.string().optional(),
			[Ids.bigLabelNo]: z.string().optional(),
			[Ids.smallLabelNo]: z.string().optional(),
			[Ids.productCode]: z.string().optional(),
			[Ids.marking]: z.string(),
		}),
	),

	[Ids.scheduleDate]: z.any(),

	[Ids.containerNo]: z.string(),
	[Ids.productsTotal]: z.string(),
	[Ids.dischargerName]: z.string().optional(),
	[Ids.dischargerPhoneNo]: z.string().optional(),
});
