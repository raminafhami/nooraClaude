import { ids } from "../models/Ids";

function validateSamplingToIssueDate(
  data: Partial<{
    [ids.samplingDate]: string;
    [ids.certificateIssueDate]: string;
  }>,
): void {
  if (!data[ids.samplingDate] || data[ids.certificateIssueDate]) {
    return;
  }

  const timeDiff = Math.abs(
    new Date(data[ids.samplingDate]!).getTime() -
      new Date(data[ids.certificateIssueDate]!).getTime(),
  );

  const daysInMs = 90 * 24 * 60 * 60 * 1000;

  if (timeDiff >= daysInMs) {
    throw new Error(
      "تاریخ صدور گواهی نمی تواند بیش از 90 روز پس از تاریخ نمونه گیری باشد.",
    );
  }
}

export { validateSamplingToIssueDate };
