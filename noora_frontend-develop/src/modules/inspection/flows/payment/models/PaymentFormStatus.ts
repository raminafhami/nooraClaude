export enum PaymentFormStatus {
  Cancel = "cancel",
  Forward = "forward",
}

export const paymentFormStatus: { [key in PaymentFormStatus]: string } = {
  [PaymentFormStatus.Forward]: "ارسال برای مالی",
  [PaymentFormStatus.Cancel]: "لغو",
};

export const paymentFormStatuses: {
  label: string;
  value: PaymentFormStatus;
}[] = Object.keys(paymentFormStatus).map((k) => {
  const key = k as PaymentFormStatus;
  return { label: paymentFormStatus[key], value: key };
});
