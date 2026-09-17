import { z } from "zod";

import { Assignees } from "@/inspection/flows/payment/models/Assignee";

import { Ids } from "../../data";

export const schema = z.object({
  [Ids.assignees]: z.custom<Assignees>(),
  [Ids.amount]: z.string(),
  [Ids.bankAccountNumber]: z.string().nullable(),
  [Ids.bankCardNumber]: z.string().nullable(),
  [Ids.bankSheba]: z.string().nullable(),
  [Ids.description]: z.string(),
  [Ids.file]: z.string(),
  [Ids.paymentDate]: z.any(),
  [Ids.priority]: z.string(),
  [Ids.title]: z.string(),
  [Ids.state]: z.string(),
  [Ids.userData]: z.string(),
  [Ids.bankAccountsOwner]: z.string(),
  [Ids.payDes]: z.string(),
  [Ids.reviewDes]: z.string(),
  [Ids.processType]: z.string(),
  [Ids.remainingAmount]: z.string(),
  [Ids.isCancel]: z.string(),
  [Ids.currency]: z.string(),
  [Ids.cashPay]: z.string(),
  [Ids.expertState]: z.string(),
  [Ids.inputType]: z.string(),
  [Ids.costsIds]: z.custom<any[]>(),
  [Ids.paidAmount]: z.custom<any[]>(),
  [Ids.userInformation]: z.custom<any>(),
});
