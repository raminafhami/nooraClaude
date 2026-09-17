import apiClient from "@/api/client";
import { TimeString } from "@/time/TimeString";

interface AttendanceEntryCreateModel {
  time: TimeString;
}

interface AttendanceEntryCreateApiModel {}

type AttendanceEntryCreateReturn = boolean;

interface AttendanceEntryCreateApiReturn {}

export async function createAttendanceEntry(
  details: AttendanceEntryCreateModel,
): Promise<AttendanceEntryCreateReturn> {
  const response = await apiClient.post<AttendanceEntryCreateApiReturn>({
    url: `/personnel-attendance`,
    body: details,
  });

  return true;
}
