import { z } from "zod";

import { Ids } from "../../data";

export const schema = z.object({
	// [Ids.customsId]: z.string(),
	[Ids.branchId]: z.string(),
	[Ids.pageNo]: z.string(),
	[Ids.buyerData]: z.custom(),
	[Ids.buyerId]: z.string(),
	[Ids.buyerName]: z.string(),
	[Ids.buyerAddress]: z.string(),
	[Ids.sealId]: z.string(),
	[Ids.bigLabelId]: z.string(),
	[Ids.smallLabelId]: z.string(),
	[Ids.coordinator]: z.string(),
	[Ids.coordinatorSignature]: z.string(),
	[Ids.productOwner]: z.string(),
	[Ids.productOwnerSignature]: z.string(),
	[Ids.samplerName]: z.string(),
	[Ids.samplerId]: z.string(),
	[Ids.samplerSignature]: z.string(),
	[Ids.sellerName]: z.string(),
	[Ids.title]: z.string(),
	[Ids.place]: z.string(),
	[Ids.inspectorStatus]: z.string(),

	[Ids.nationalNo]: z.string(),
	[Ids.economicalNo]: z.string(),
	[Ids.cottageDate]: z.string(),
	[Ids.cottageNo]: z.string(),
	[Ids.receipt]: z.string(),
	[Ids.samplesCount]: z.string(),

	[Ids.productsData]: z.array(
		z.object({
			[Ids.productName]: z.string(),
			[Ids.productId]: z.string(),
			[Ids.codes]: z.array(z.string()),
			[Ids.model]: z.string(),
			[Ids.brand]: z.string(),
			[Ids.sampleAmount]: z.string(),
			[Ids.unit]: z.string(),
			[Ids.manufactureCountry]: z.string(),
			[Ids.standardMethod]: z.string(),
			[Ids.packingType]: z.array(
				z.object({
					[Ids.productName]: z.string(),
					[Ids.productId]: z.string(),
					[Ids.codes]: z.array(z.string()),
				}),
			),
			[Ids.sealNo]: z.string().optional(),
			[Ids.bigLabelNo]: z.string().optional(),
			[Ids.smallLabelNo]: z.string().optional(),
			[Ids.productCode]: z.string().optional(),
			[Ids.marking]: z.string(),
		}),
	),

	[Ids.samplingCosts]: z.array(
		z.object({ value: z.string(), label: z.string() }),
	),
	[Ids.containerNo]: z.string(),
	[Ids.productsTotal]: z.string(),
	[Ids.reportConclusion]: z.string(),
	[Ids.dischargerName]: z.string().optional(),
	[Ids.dischargerPhoneNo]: z.string().optional(),
});
