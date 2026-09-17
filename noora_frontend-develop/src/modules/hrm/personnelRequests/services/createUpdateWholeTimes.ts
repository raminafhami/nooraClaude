import apiClient from "@/api/client";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";

export interface UpdateWholeTimes {
  date: AttendanceDateString;
  times: string;
  userId?: string;
}

export async function createUpdateWholeTimes(
  data: UpdateWholeTimes,
): Promise<boolean> {
  const response = await apiClient.post({
    url: "/personnel-attendance/update-whole-times",
    body: data,
  });

  return response.success;
}
