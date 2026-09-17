import { Branch } from "@/branches/models/Branch";
import { CaseType } from "@/inspection/models/CaseType";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";

import { CaseBuyer } from "./CaseData";
import { instanceIds as ids } from "./InstanceIds";

export interface InstanceData {
  [ids.assignees]: {
    customer: { id: string; name: string };
  };
  [ids.branch]: Branch | null;
  [ids.buyer]: CaseBuyer;
  [ids.caseType]: CaseType;
  [ids.caseInvoiceDate]: string | null;
  [ids.caseInvoiceNo]: string | null;
  [ids.inspectionFee]: string;
  [ids.inspectionFeeInRial]: string;
  [ids.invoiceTax]: string;
  [ids.invoiceDuty]: string;
  [ids.invoiceToll]: string;
  [ids.invoiceTotal]: string;
  [ids.invoiceRemaining]: string;
  [ids.paymentStatus]: InvoicePaymentStatus;
}
