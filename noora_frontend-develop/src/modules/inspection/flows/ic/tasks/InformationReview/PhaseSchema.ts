import { z } from "zod";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";

export const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.inspectionCaseNo]: z.string().nullable(),
	[ids.inspectionInstanceId]: z.string().nullable(),
	[ids.informationReviewStatus]: z.string(),
	[ids.informationReviewNote]: z.string(),
});
