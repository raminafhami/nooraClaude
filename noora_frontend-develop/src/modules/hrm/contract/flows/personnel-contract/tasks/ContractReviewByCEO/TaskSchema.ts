import { z } from "zod";

import { Assignees } from "../../models/Assignees";
import { ids } from "../../models/Ids";
import { PreviousTask } from "../../models/PreviousTask";

export const schema = z.object({
  [ids.previousTask]: z.custom<PreviousTask>(),
  [ids.assignees]: z.custom<Assignees>(),
  [ids.contractReviewNoteByCEO]: z.string(),
  [ids.contractReviewStatusByCEO]: z.string(),
});
