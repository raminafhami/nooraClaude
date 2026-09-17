import { z } from "zod";

import { Assignees, ids } from "../../data";

export const schema = z.object({
  [ids.assignees]: z.custom<Assignees>(),
  [ids.letterPriority]: z.string(),
  [ids.letterConfidentiality]: z.string(),
  [ids.letterToName]: z.string(),
  [ids.letterToPosition]: z.string().optional(),
  [ids.letterSubject]: z.string().optional(),
  [ids.letterBody]: z.string(),
  [ids.letterTranscriptions]: z.string().optional(),
  [ids.letterHasAttachments]: z.boolean(),
  [ids.relatedInspectionCaseNo]: z.string().optional(),
  [ids.letterFollowingOfs]: z.string().optional(),
  [ids.sendType]: z.string().optional(),
  [ids.recipients]: z.array(z.custom()).optional(),
  [ids.needsToBeArchived]: z.string(),
  [ids.letterFormByAuthorNote]: z.string(),
  [ids.isFile]: z.string(),
  [ids.letterDate]: z.date(),
});
