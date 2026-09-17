import { z } from "zod";

import { Assignees } from "../../models/Assignee";
import { HistoryReviewStatus } from "../../models/HistoryReviewStatus";
import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.assignees]: z.custom<Assignees>(),
  [ids.historyReviewNote]: z.string(),
  [ids.historyReviewStatus]: z.custom<HistoryReviewStatus>(),
});
