import { z } from "zod";

import { CaseData } from "../../models/CaseData";
import { ids } from "../../models/Ids";

export const schema = z.object({
  [ids.inspectionCases]: z.array(z.custom<CaseData>()),
  [ids.voucherNo]: z.string(),
  [ids.payerSepidarId]: z.string().nullable(),
  [ids.paymentIssueNote]: z.string(),
});
