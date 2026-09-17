export enum ReviewStatus {
  Forward = "forward",
  Return = "return",
}

export const reviewStatus: {
  [key in ReviewStatus]: string;
} = {
  [ReviewStatus.Forward]: "تایید",
  [ReviewStatus.Return]: "بازگشت برای اصلاح",
};

export const reviewStatusOptions: {
  label: string;
  value: ReviewStatus;
}[] = Object.keys(reviewStatus).map((k) => {
  const key = k as ReviewStatus;
  return { label: reviewStatus[key], value: key };
});
