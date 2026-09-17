import { getObjectEntries } from "@/utils/object/getObjectEntries";

export enum ReviewStatus {
  Forward = "forward",
  Cancel = "cancel",
}

export const reviewStatus: {
  [key in ReviewStatus]: string;
} = {
  [ReviewStatus.Forward]: "تایید",
  [ReviewStatus.Cancel]: "لغو درخواست",
};

export const reviewStatusOptions: {
  label: string;
  value: ReviewStatus;
}[] = getObjectEntries(reviewStatus).map(([key, title]) => {
  return { label: title, value: key };
});
