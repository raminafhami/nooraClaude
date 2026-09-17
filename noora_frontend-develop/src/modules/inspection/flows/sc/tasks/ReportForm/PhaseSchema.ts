import { z } from "zod";

import { Assignees } from "../../models/Assignee";
import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.assignees]: z.custom<Assignees>(),
  [ids.inspectionDate]: z.string(),
  [ids.reportDescription]: z.string(),
  [ids.reportIssueDate]: z.string(),
  [ids.reportIssueNo]: z.string(),
  [ids.reportSubject]: z.string(),
});
