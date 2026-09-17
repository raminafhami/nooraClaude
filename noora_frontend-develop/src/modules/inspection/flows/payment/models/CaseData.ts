import { InspectionType } from "@/inspection/models/InspectionType";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";

import { CasePaymentStatus } from "./CasePaymentStatus";

export interface CaseData {
  instanceId: string;
  caseNo: string;
  inspectionType: InspectionType;
  buyer: CaseBuyer;
  invoiceDate: string | null;
  invoiceNo: string | null;
  inspectionFee: string;
  invoiceTax: string;
  invoiceDuty: string;
  invoiceTotal: string;
  invoiceRemaining: string;
  paymentAmount: string;
  paymentStatus: CasePaymentStatus;
  previousPaymentStatus: InvoicePaymentStatus;
}

export interface CaseBuyer {
  id: string;
  name: string;
  sepidarId?: string | null;
}
