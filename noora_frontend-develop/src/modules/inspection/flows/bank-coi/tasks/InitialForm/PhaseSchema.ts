import { z } from "zod";

import { Buyer } from "@/buyers/models/Buyer";
import { CaseType } from "@/inspection/models/CaseType";

import { Assignees } from "../../models/Assignee";
import { Branch } from "../../models/Branch";
import { ids } from "../../models/Ids";

export const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.initialFormStatus]: z.string(),
	[ids.initialFormNote]: z.string(),
	[ids.bankBranch]: z.string(),
	[ids.bankName]: z.string(),
	[ids.branch]: z.custom<Branch>().nullable(),
	[ids.buyer]: z.custom<Buyer>().optional(),
	[ids.caseType]: z.custom<CaseType>().optional(),
	[ids.countryOfOrigin]: z.string(),
	[ids.customName]: z.string(),
	[ids.dischargerName]: z.string(),
	[ids.dischargerPhoneNo]: z.string(),
	[ids.goodsCustomTariffNos]: z.string(),
	[ids.goodsDescriptions]: z.string(),
	[ids.goodsField]: z.string(),
	[ids.inspectionPlace]: z.string(),
	[ids.proformaDate]: z.string(),
	[ids.proformaNo]: z.string(),
	[ids.registrationOrderDate]: z.string(),
	[ids.registrationOrderNo]: z.string(),
});
