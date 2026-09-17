import { z } from "zod";

import { CaseType } from "@/inspection/models/CaseType";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";

export const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.caseType]: z.custom<CaseType>(),
});
