export type InvoicePaymentRequests = InvoicePaymentRequest[];

export interface InvoicePaymentRequest {
  instanceId: string;
  caseNo: string;
  payment?: {
    voucherNo?: string;
    paymentDate: string;
  };
  status: InvoicePaymentRequestStatus;
}

export enum InvoicePaymentRequestStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Canceled = "canceled",
}
