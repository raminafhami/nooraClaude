import { z } from "zod";

import { Ids } from "../../data";

export const schema = z.object({
	[Ids.date]: z.string(),
	[Ids.pageNo]: z.string(),
	[Ids.place]: z.string(),
	[Ids.price]: z.string(),
	[Ids.productionUnitName]: z.string(),
	[Ids.inspectorStatus]: z.string(),
	[Ids.laboratoryManager]: z.string(),
	[Ids.productiveSignature]: z.string(),
	[Ids.qcName]: z.string(),
	[Ids.qcSignature]: z.string(),

	[Ids.systemBarcode]: z.string(),
	[Ids.type]: z.string(),

	[Ids.productsData]: z.array(
		z.object({
			[Ids.productName]: z.string(),
			[Ids.productType]: z.string(),
			[Ids.model]: z.string(),
			[Ids.brand]: z.string(),
			[Ids.manufactureDate]: z.string(),
			[Ids.sampleAmount]: z.string(),
			[Ids.unit]: z.string(),
			[Ids.buildNo]: z.string(),
			[Ids.packageNo]: z.string(),
			[Ids.packingType]: z.array(
				z.object({
					[Ids.productName]: z.string(),
					[Ids.productId]: z.string(),
					[Ids.codes]: z.array(z.string()),
				}),
			),
			[Ids.delivered]: z.string().optional(),
			[Ids.constructionSeries]: z.string(),
			[Ids.physicalCharacteristics]: z.string(),
			[Ids.sealNo]: z.string().optional(),
			[Ids.maintenance]: z.string(),
			[Ids.controlSample]: z.array(
				z.object({
					[Ids.productName]: z.string(),
					[Ids.productId]: z.string(),
					[Ids.status]: z.string().nullable(),
					[Ids.codes]: z.array(z.string()),
				}),
			),
			[Ids.controlSampleSealNo]: z.string().optional(),
			[Ids.controlSampleBigLabelNo]: z.string().optional(),
			[Ids.controlSampleSmallLabelNo]: z.string().optional(),
			[Ids.descriptions]: z.string().optional(),
		}),
	),

	[Ids.dischargerName]: z.string().optional(),
	[Ids.dischargerPhoneNo]: z.string().optional(),
});
