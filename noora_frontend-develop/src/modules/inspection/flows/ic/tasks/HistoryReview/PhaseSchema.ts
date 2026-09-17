import { z } from "zod";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { ReviewStatus } from "./ReviewStatus";

export const schema = z.object({
  [ids.assignees]: z.custom<Assignees>(),
  [ids.historyReviewNote]: z.string(),
  [ids.historyReviewStatus]: z.custom<ReviewStatus>(),
});
