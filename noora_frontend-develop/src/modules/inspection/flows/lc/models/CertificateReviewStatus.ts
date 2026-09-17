export enum CertificateReviewStatus {
  Confirm = "confirm",
  Return = "return",
}

export const certificateReviewStatus: {
  [key in CertificateReviewStatus]: string;
} = {
  [CertificateReviewStatus.Confirm]: "تایید",
  [CertificateReviewStatus.Return]: "بازگشت برای کارشناس",
};

export const certificateReviewStatuses: {
  label: string;
  value: CertificateReviewStatus;
}[] = Object.keys(certificateReviewStatus).map((k) => {
  const key = k as CertificateReviewStatus;
  return { label: certificateReviewStatus[key], value: key };
});
