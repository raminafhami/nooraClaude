import { z } from "zod";

import { PreviousTask } from "@/inspection/models/PreviousTask";

import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.previousTask]: z.custom<PreviousTask>(),
  [ids.certificateIssueDate]: z.string().nullable(),
  [ids.certificateIssueNo]: z.string().nullable(),
  [ids.certificateTemplateStatus]: z.string(),
});
