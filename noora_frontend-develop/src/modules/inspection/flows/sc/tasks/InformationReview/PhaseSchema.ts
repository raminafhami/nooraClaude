import { z } from "zod";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";

export const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.contractIssueDate]: z.string(),
	[ids.contractIssueNo]: z.string(),
	[ids.informationReviewStatus]: z.string(),
	[ids.informationReviewNote]: z.string(),
	[ids.inspectionInstanceId]: z.string().nullable(),
	[ids.inspectionCaseNo]: z.string().nullable(),
});
