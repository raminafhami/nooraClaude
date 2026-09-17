export enum HistoryReviewStatus {
  Confirm = "confirm",
  Return = "return",
}

export const historyReviewStatus: {
  [key in HistoryReviewStatus]: string;
} = {
  [HistoryReviewStatus.Confirm]: "تایید",
  [HistoryReviewStatus.Return]: "بازگشت برای کارشناس",
};

export const historyReviewStatuses: {
  label: string;
  value: HistoryReviewStatus;
}[] = Object.keys(historyReviewStatus).map((k) => {
  const key = k as HistoryReviewStatus;
  return { label: historyReviewStatus[key], value: key };
});
