enum ReviewStatus {
  Confirm = "confirm",
  Return = "return",
  // Cancel = "cancel",
}

const reviewStatus: { [key in ReviewStatus]: string } = {
  [ReviewStatus.Confirm]: "تایید",
  [ReviewStatus.Return]: "بازگشت به کارشناس",
  // [ReviewStatus.Cancel]: "لغو",
};

const reviewStatusOptions = Object.entries(reviewStatus).map(
  ([key, value]) => ({ label: value, value: key }),
);

export { ReviewStatus, reviewStatus, reviewStatusOptions };
