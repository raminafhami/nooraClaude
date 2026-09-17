export enum PaymentReviewStatus {
  Confirm = "confirm",
  Return = "return",
}

export const paymentReviewStatus: { [key in PaymentReviewStatus]: string } = {
  [PaymentReviewStatus.Confirm]: "تایید",
  [PaymentReviewStatus.Return]: "بازگشت",
};

export const paymentReviewStatusOptions: {
  label: string;
  value: PaymentReviewStatus;
}[] = Object.keys(paymentReviewStatus).map((k) => {
  const key = k as PaymentReviewStatus;
  return { label: paymentReviewStatus[key], value: key };
});
