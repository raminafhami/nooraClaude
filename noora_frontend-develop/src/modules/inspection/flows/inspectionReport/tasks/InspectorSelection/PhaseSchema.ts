import { z } from "zod";

import { Instance } from "@/felo/instances/models/Instance";

import { Ids } from "../../data";

const messages = {
	required: "پر کردن این فیلد اجباری است!",
};

export const schema = z.object({
	[Ids.inspectionCaseNo]: z.string(),
	[Ids.inspectionExpert]: z.string(),
	[Ids.inspectorName]: z.string().min(1, messages.required),
	[Ids.inspectorPhone]: z.string(),
	[Ids.inspectionType]: z.string(),
	[Ids.descriptionOfGoods]: z.custom<any[]>(),
	[Ids.buyerName]: z.string(),
	[Ids.seller]: z.string(),
	[Ids.fieldOfGoods]: z.string(),
	[Ids.dischargerName]: z.string(),
	[Ids.dischargerPhoneNo]: z.string(),
	[Ids.packing]: z.string(),
	[Ids.inspectortype]: z.string(),
	[Ids.inspectorAssignee]: z.string().min(1, messages.required),
	[Ids.inspectionInstanceId]: z.string(),
	[Ids.proformaNo]: z.string(),
	[Ids.proformaDate]: z.string(),
	[Ids.inspectionTools]: z.string(),
	[Ids.quantityReport]: z.string(),
	[Ids.packingReport]: z.string(),
	[Ids.loadingReport]: z.string(),
	[Ids.quantity]: z.string(),
	[Ids.quantityDes]: z.string(),
	[Ids.appearence]: z.string(),
	[Ids.appearenceDes]: z.string(),
	[Ids.marketingLabel]: z.string(),
	[Ids.marketingLabelDes]: z.string(),
	[Ids.testing]: z.string(),
	[Ids.testingDes]: z.string(),
	[Ids.description]: z.string(),
	[Ids.referenceNumber]: z.string(),
	[Ids.inspectionOverall]: z.string(),
	[Ids.status]: z.string(),
	[Ids.longitude]: z.string(),
	[Ids.latitude]: z.string(),
	[Ids.inspectionExpertName]: z.string(),
	[Ids.factoryGateNote]: z.string(),
	[Ids.appearanceNote]: z.string(),
	[Ids.markingLabelNote]: z.string(),
	[Ids.sealsNote]: z.string(),
	[Ids.samplingNote]: z.string(),
	[Ids.testingNote]: z.string(),
	[Ids.loadingNote]: z.string(),
	[Ids.scheduleDate]: z.any(),
	[Ids.quantityControl]: z.custom<any[]>(),
	[Ids.rejectDescriptionList]: z.custom<any[]>(),
	[Ids.inspectionData]: z.custom<Instance>(),
});
