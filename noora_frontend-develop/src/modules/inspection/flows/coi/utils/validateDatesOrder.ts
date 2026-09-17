import { ids } from "../models/Ids";
import { InspectionMethod } from "../models/InspectionMethod";

function validateDatesOrder(
  method: InspectionMethod,
  data: Partial<{
    [ids.proformaDate]: string;
    [ids.samplingDate]: string;
    [ids.testDateStart]: string;
    [ids.testDateEnd]: string;
    [ids.loadingDate]: string;
    [ids.billOfLadingDate]: string;
    [ids.certificateIssueDate]: string;
  }>,
): void {
  const proformaDate = data[ids.proformaDate]
    ? new Date(data[ids.proformaDate]!)
    : undefined;
  const samplingDate = data[ids.samplingDate]
    ? new Date(data[ids.samplingDate]!)
    : undefined;
  const testStartDate = data[ids.testDateStart]
    ? new Date(data[ids.testDateStart]!)
    : undefined;
  const testEndDate = data[ids.testDateEnd]
    ? new Date(data[ids.testDateEnd]!)
    : undefined;
  const loadingDate = data[ids.loadingDate]
    ? new Date(data[ids.loadingDate]!)
    : undefined;
  const blDate = data[ids.billOfLadingDate]
    ? new Date(data[ids.billOfLadingDate]!)
    : undefined;
  const issueDate = data[ids.certificateIssueDate]
    ? new Date(data[ids.certificateIssueDate]!)
    : undefined;

  // source
  if (method === InspectionMethod.Source) {
    if (samplingDate && proformaDate && samplingDate < proformaDate) {
      throw new Error("تاریخ نمونه گیری نمی تواند پیش از تاریخ پروفرما باشد.");
    } else if (testStartDate && samplingDate && testStartDate < samplingDate) {
      throw new Error(
        "تاریخ شروع آزمون نمی تواند پیش از تاریخ نمونه گیری باشد.",
      );
    } else if (testEndDate && testStartDate && testEndDate < testStartDate) {
      throw new Error(
        "تاریخ پایان آزمون نمی تواند پیش از تاریخ شروع آزمون باشد.",
      );
    } else if (loadingDate && testEndDate && loadingDate < testEndDate) {
      throw new Error("تاریخ بارگیری نمی تواند پیش از تاریخ پایان آزمون باشد.");
    } else if (blDate && loadingDate && blDate < loadingDate) {
      throw new Error("تاریخ بارنامه نمی تواند پیش از تاریخ بارگیری باشد.");
    } else if (issueDate && blDate && issueDate < blDate) {
      throw new Error("تاریخ صدور گواهی نمی تواند پیش از تاریخ بارنامه باشد.");
    }
  }
  // destination
  else if (method === InspectionMethod.Destination) {
    if (blDate && proformaDate && blDate <= proformaDate) {
      throw new Error(
        "تاریخ بارنامه نمی تواند پیش از یا برابر تاریخ پروفرما باشد.",
      );
    } else if (samplingDate && blDate && samplingDate <= blDate) {
      throw new Error(
        "تاریخ نمونه گیری نمی تواند پیش از یا برابر تاریخ بارنامه باشد.",
      );
    } else if (testStartDate && samplingDate && testStartDate < samplingDate) {
      throw new Error(
        "تاریخ شروع آزمون نمی تواند پیش از تاریخ نمونه گیری باشد.",
      );
    } else if (testEndDate && testStartDate && testEndDate < testStartDate) {
      throw new Error(
        "تاریخ پایان آزمون نمی تواند پیش از تاریخ شروع آزمون باشد.",
      );
    } else if (issueDate && testEndDate && issueDate <= testEndDate) {
      throw new Error(
        "تاریخ صدور گواهی نمی تواند پیش از یا برابر تاریخ پایان تست باشد.",
      );
    }
  }
  // document-inspection
  else if (method === InspectionMethod.DocumentInspection) {
    if (blDate && proformaDate && blDate < proformaDate) {
      throw new Error("تاریخ بارنامه نمی تواند پیش از تاریخ پروفرما باشد.");
    } else if (issueDate && blDate && issueDate < blDate) {
      throw new Error("تاریخ گواهی نمی تواند پیش از تاریخ بارنامه باشد.");
    }
  }
}

export { validateDatesOrder };
