enum ReviewStatus {
  Confirm = "confirm",
  Return = "return",
}

const reviewStatus: { [key in ReviewStatus]: string } = {
  [ReviewStatus.Confirm]: "تایید",
  [ReviewStatus.Return]: "بازگشت به کارشناس",
};

const reviewStatusOptions = Object.entries(reviewStatus).map(
  ([key, value]) => ({ label: value, value: key })
);

export { ReviewStatus, reviewStatus, reviewStatusOptions };
