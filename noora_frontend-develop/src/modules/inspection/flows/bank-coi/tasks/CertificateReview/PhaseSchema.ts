import { z } from "zod";

import { ReviewStatus } from "../../models/CertificateReviewStatus";
import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.certificateIssueDate]: z.string(),
  [ids.certificateIssueNo]: z.string(),
  [ids.certificateReviewNote]: z.string(),
  [ids.certificateReviewStatus]: z.custom<ReviewStatus>(),
});
