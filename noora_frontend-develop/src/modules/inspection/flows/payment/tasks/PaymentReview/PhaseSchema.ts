import { z } from "zod";

import { Assignees } from "../../models/Assignee";
import { CaseData } from "../../models/CaseData";
import { ids } from "../../models/Ids";
import { PaymentReviewStatus } from "../../models/PaymentReviewStatus";

export const schema = z.object({
  [ids.assignees]: z.custom<Assignees>(),
  [ids.inspectionCases]: z.array(z.custom<CaseData>()),
  [ids.paymentReviewNote]: z.string(),
  [ids.paymentReviewStatus]: z.custom<PaymentReviewStatus>(),
});
