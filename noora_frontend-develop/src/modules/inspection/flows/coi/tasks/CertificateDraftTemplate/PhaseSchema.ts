import { z } from "zod";

import { PreviousTask } from "@/inspection/models/PreviousTask";
import { ReviewStatus } from "@/inspection/models/ReviewStatus";

import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.previousTask]: z.custom<PreviousTask>(),
  [ids.certificateDraftTemplateStatus]: z.custom<ReviewStatus>(),
});
