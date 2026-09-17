import { z } from "zod";

import { PreviousTask } from "@/inspection/models/PreviousTask";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";

export const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Assignees>(),
	[ids.informationReviewStatus]: z.string(),
	[ids.informationReviewNote]: z.string(),
	[ids.inspectionCaseNo]: z.string().nullable(),
	[ids.inspectionInstanceId]: z.string().nullable(),
});
