import { z } from "zod";

import { CertificateReviewStatus } from "../../models/CertificateReviewStatus";
import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.certificateIssuanceNote]: z.string(),
  [ids.certificateIssuanceStatus]: z.custom<CertificateReviewStatus>(),
  [ids.certificateIssueDate]: z.string(),
  [ids.certificateIssueNo]: z.string(),
});
