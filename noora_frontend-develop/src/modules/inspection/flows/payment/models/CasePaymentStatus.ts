export enum CasePaymentStatus {
  Complete = "complete",
  Incomplete = "incomplete",
  Ias = "ias", // insurance account settlement
}

export const casePaymentStatus: { [key in CasePaymentStatus]: string } = {
  [CasePaymentStatus.Complete]: "پرداخت کامل",
  [CasePaymentStatus.Ias]: "پرداخت کامل (مفاصا حساب بیمه)",
  [CasePaymentStatus.Incomplete]: "پرداخت ناقص",
};

export const casePaymentStatuses: {
  label: string;
  value: CasePaymentStatus;
}[] = Object.keys(casePaymentStatus).map((k) => {
  const key = k as CasePaymentStatus;
  return { label: casePaymentStatus[key], value: key };
});
