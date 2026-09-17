export enum ReviewStatus {
  Confirm = "confirm",
  Return = "return",
  // Cancel = "cancel",
}

export const reviewStatus: {
  [key in ReviewStatus]: string;
} = {
  [ReviewStatus.Confirm]: "تایید",
  [ReviewStatus.Return]: "بازگشت برای کارشناس",
  // [ReviewStatus.Cancel]: "لغو درخواست",
};

export const reviewStatuses: {
  label: string;
  value: ReviewStatus;
}[] = Object.keys(reviewStatus).map((k) => {
  const key = k as ReviewStatus;
  return { label: reviewStatus[key], value: key };
});
