export enum InformationReviewStatus {
  Confirm = "confirm",
  Return = "return",
  // Cancel = "cancel",
}

export const informationReviewStatus: {
  [key in InformationReviewStatus]: string;
} = {
  [InformationReviewStatus.Confirm]: "تایید",
  [InformationReviewStatus.Return]: "بازگشت برای کارشناس",
  // [InformationReviewStatus.Cancel]: "لغو درخواست",
};

export const informationReviewStatuses: {
  label: string;
  value: InformationReviewStatus;
}[] = Object.keys(informationReviewStatus).map((k) => {
  const key = k as InformationReviewStatus;
  return { label: informationReviewStatus[key], value: key };
});
