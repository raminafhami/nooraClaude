import { z } from "zod";

import { CaseType } from "@/inspection/models/CaseType";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { InspectionMethod } from "../../models/InspectionMethod";

export const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.inspectionMethod]: z.custom<InspectionMethod>(),
	[ids.caseType]: z.custom<CaseType>(),
});
