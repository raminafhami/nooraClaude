import { z } from "zod";

import { Buyer } from "@/buyers/models/Buyer";
import { CaseType } from "@/inspection/models/CaseType";

import { Assignees } from "../../models/Assignee";
import { Branch } from "../../models/Branch";
import { ids } from "../../models/Ids";
import { ReviewStatus } from "./ReviewStatus";

export const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.branch]: z.custom<Branch>().nullable(),
	[ids.buyer]: z.custom<Buyer>(),
	[ids.caseType]: z.custom<CaseType>().optional(),
	[ids.creditOpeningBankBranch]: z.string(),
	[ids.creditOpeningBankName]: z.string(),
	[ids.dischargerName]: z.string().nullable(),
	[ids.dischargerPhoneNo]: z.string().nullable(),
	[ids.goodsDescriptions]: z.string(),
	[ids.goodsField]: z.string(),
	[ids.informationFormStatus]: z.custom<ReviewStatus>(),
	[ids.informationFormNote]: z.string(),
	[ids.invoiceFob]: z.string(),
	[ids.proformaDate]: z.string(),
	[ids.proformaNo]: z.string(),
});
