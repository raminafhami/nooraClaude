import { z } from "zod";

import { Buyer } from "@/buyers/models/Buyer";
import { CaseType } from "@/inspection/models/CaseType";

import { Assignees } from "../../models/Assignee";
import { Branch } from "../../models/Branch";
import { ids } from "../../models/Ids";
import { InspectionMethod } from "../../models/InspectionMethod";
import { ReviewStatus } from "./ReviewStatus";

export const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.bankBranch]: z.string().nullable(),
	[ids.bankName]: z.string().nullable(),
	[ids.branch]: z.custom<Branch>().nullable(),
	[ids.buyer]: z.custom<Buyer>(),
	[ids.buyerNameEn]: z.string(),
	[ids.caseType]: z.custom<CaseType>().optional(),
	[ids.contractMethod]: z.string(),
	[ids.customName]: z.string(),
	[ids.dischargerName]: z.string().nullable(),
	[ids.dischargerPhoneNo]: z.string().nullable(),
	[ids.goodsCustomTariffNos]: z.string(),
	[ids.goodsDescriptions]: z.string(),
	[ids.goodsField]: z.string(),
	[ids.informationFormByExpertNote]: z.string(),
	[ids.informationFormByExpertStatus]: z.custom<ReviewStatus>(),
	[ids.invoiceFob]: z.string(),
	[ids.inspectionMethod]: z.custom<InspectionMethod>(),
	[ids.proformaDate]: z.string(),
	[ids.proformaNo]: z.string(),
	[ids.registrationOrderDate]: z.string(),
	[ids.registrationOrderNo]: z.string(),
});
