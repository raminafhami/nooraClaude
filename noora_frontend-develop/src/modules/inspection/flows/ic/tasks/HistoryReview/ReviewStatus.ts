export enum ReviewStatus {
  Approve = "approve",
  Return = "return",
}

export const reviewStatus: {
  [key in ReviewStatus]: string;
} = {
  [ReviewStatus.Approve]: "تایید",
  [ReviewStatus.Return]: "بازگشت برای کارشناس",
};

export const reviewStatusOptions: {
  label: string;
  value: ReviewStatus;
}[] = Object.keys(reviewStatus).map((k) => {
  const key = k as ReviewStatus;
  return { label: reviewStatus[key], value: key };
});
