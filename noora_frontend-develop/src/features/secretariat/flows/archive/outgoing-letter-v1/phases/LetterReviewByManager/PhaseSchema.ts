import { z } from "zod";

import { Assignees, ids } from "../../data";

export const schema = z.object({
  [ids.assignees]: z.custom<Assignees>(),
  [ids.letterNo]: z.string(),
  [ids.letterDate]: z.string(),
  [ids.letterConfidentiality]: z.string(),
  [ids.letterToName]: z.string(),
  [ids.letterToPosition]: z.string().optional(),
  [ids.letterSubject]: z.string().optional(),
  [ids.letterBody]: z.string(),
  [ids.letterTranscriptions]: z.string().optional(),
  [ids.letterSignature]: z.string(),
  [ids.letterReviewByManagerStatus]: z.string(),
  [ids.letterReviewByManagerNote]: z.string(),
  [ids.isFile]: z.string(),
});
