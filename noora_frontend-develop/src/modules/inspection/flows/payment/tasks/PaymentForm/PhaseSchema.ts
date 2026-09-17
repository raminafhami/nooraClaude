import { z } from "zod";

import { CaseType } from "@/inspection/models/CaseType";

import { ActionName } from "../../models/ActionName";
import { Assignees } from "../../models/Assignee";
import { CaseData } from "../../models/CaseData";
import { ids } from "../../models/Ids";
import { PaymentFormStatus } from "../../models/PaymentFormStatus";
import { PaymentType } from "../../models/PaymentTypes";

export const schema = z.object({
  [ids.actionName]: z.custom<ActionName>(),
  [ids.assignees]: z.custom<Assignees>(),
  [ids.bankAccount]: z.string().nullable(),
  [ids.caseType]: z.custom<CaseType>(),
  [ids.inspectionCases]: z.array(z.custom<CaseData>()),
  [ids.isCaseActionsAllowed]: z.string(),
  [ids.payerSepidarId]: z.string().nullable(),
  [ids.paymentAmount]: z.string(),
  [ids.paymentDate]: z.string(),
  [ids.paymentFormNote]: z.string(),
  [ids.paymentFormStatus]: z.custom<PaymentFormStatus>(),
  [ids.paymentType]: z.custom<PaymentType>(),
  [ids.receiptNo]: z.string(),
});
