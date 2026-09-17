import { z } from "zod";

import { Buyer } from "@/buyers/models/Buyer";
import { CaseType } from "@/inspection/models/CaseType";

import { Assignees } from "../../models/Assignee";
import { Branch } from "../../models/Branch";
import { ContractAttachmentStatus } from "../../models/ContractAttachmentStatus";
import { ids } from "../../models/Ids";

export const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.authorityOrganization]: z.string(),
	[ids.authorityPerson]: z.string(),
	[ids.branch]: z.custom<Branch>().nullable(),
	[ids.buyer]: z.custom<Buyer>(),
	[ids.caseOperationDescription]: z.string(),
	[ids.caseOperationSummary]: z.string(),
	[ids.caseType]: z.custom<CaseType>().optional(),
	[ids.contractAttachmentStatus]: z.custom<ContractAttachmentStatus>(),
	[ids.contractDuration]: z.string(),
	[ids.contractEmployerObligations]: z.string(),
	[ids.contractEndDate]: z.string(),
	[ids.contractInspectorObligations]: z.string(),
	[ids.contractObligationsFulfillmentArticle]: z.string(),
	[ids.contractObligationsFulfillmentClauses]: z.string(),
	[ids.contractStartDate]: z.string(),
	[ids.contractSubject]: z.string(),
	[ids.contractSubjectArticle]: z.string(),
	[ids.cottageNo]: z.string(),
	[ids.goodsDescriptions]: z.string(),
	[ids.goodsField]: z.string(),
	[ids.goodsQuantity]: z.string(),
	[ids.goodsQuantityUnit]: z.string(),
	[ids.informationFormNote]: z.string(),
	[ids.inspectionPlace]: z.string(),
});
