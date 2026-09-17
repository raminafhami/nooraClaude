type CostPayment = {
  caseId: string;
  caseNo: string;
  vouchers?: CostPaymentVoucher[];
};

type CostPaymentVoucher = {
  voucherNo: number;
  date: Date;
};

export type { CostPayment, CostPaymentVoucher };
