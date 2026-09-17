import { ids } from "../models/Ids";

function validateWeekdayIssueDate(
  data: Partial<{
    [ids.certificateIssueDate]: string;
  }>,
): void {
  const issueDate = new Date(data[ids.certificateIssueDate]!);

  if (issueDate.getDay() === 5) {
    throw new Error("تاریخ صدور گواهی روز جمعه نمی تواند باشد.");
  }
}

export { validateWeekdayIssueDate };
