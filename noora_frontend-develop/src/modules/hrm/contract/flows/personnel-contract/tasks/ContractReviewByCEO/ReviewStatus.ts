export enum ReviewStatus {
  Forward = "forward",
  ReturnHR = "return-hr",
  ReturnQA = "return-qa",
  ReturnFinancial = "return-financial",
  ReturnPersonnel = "return-personnel",
}

export const reviewStatus: {
  [key in ReviewStatus]: string;
} = {
  [ReviewStatus.Forward]: "تایید",
  [ReviewStatus.ReturnHR]: "بازگشت برای اصلاح به منابع انسانی",
  [ReviewStatus.ReturnQA]: "بازگشت برای اصلاح به تضمین کیفیت",
  [ReviewStatus.ReturnFinancial]: "بازگشت برای اصلاح به مالی",
  [ReviewStatus.ReturnPersonnel]: "بازگشت برای اصلاح به پرسنل",
};

export const reviewStatusOptions: {
  label: string;
  value: ReviewStatus;
}[] = Object.keys(reviewStatus).map((k) => {
  const key = k as ReviewStatus;
  return { label: reviewStatus[key], value: key };
});
