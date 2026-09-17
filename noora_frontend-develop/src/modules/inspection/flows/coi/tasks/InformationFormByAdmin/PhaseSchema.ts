import { z } from "zod";

import { Buyer } from "@/buyers/models/Buyer";
import { CaseType } from "@/inspection/models/CaseType";
import { PreviousTask } from "@/inspection/models/PreviousTask";

import { Assignees } from "../../models/Assignee";
import { Branch } from "../../models/Branch";
import { ids } from "../../models/Ids";

export const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Assignees>(),
	[ids.branch]: z.custom<Branch>().nullable(),
	[ids.buyer]: z.custom<Buyer>().optional(),
	[ids.caseType]: z.custom<CaseType>().optional(),
	[ids.countryOfOrigin]: z.string(),
	[ids.customName]: z.string(),
	[ids.dischargerName]: z.string(),
	[ids.dischargerPhoneNo]: z.string(),
	[ids.goodsDescriptions]: z.string(),
	[ids.goodsField]: z.string(),
	[ids.informationFormByAdminStatus]: z.custom(),
	[ids.informationFormByAdminNote]: z.string(),
	[ids.inspectionPlace]: z.string(),
	[ids.numOfInspectionDays]: z.string(),
});
