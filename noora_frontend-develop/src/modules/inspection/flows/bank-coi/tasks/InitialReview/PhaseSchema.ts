import { z } from "zod";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { ReviewStatus } from "../../models/InitialReviewStatus";

export const schema = z.object({
	[ids.assignees]: z.custom<Assignees>(),
	[ids.initialReviewStatus]: z.custom<ReviewStatus>(),
	[ids.initialReviewNote]: z.string(),
	[ids.inspectionCaseNo]: z.string().nullable(),
	[ids.inspectionInstanceId]: z.string().nullable(),
});
