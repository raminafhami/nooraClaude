import apiClient from "@/api/client";
import { PagedResultApiModel } from "@/models/PagedResult";

import { Attendance, AttendanceApiModel } from "../models/Attendance";
import { AttendanceDateString } from "../models/AttendanceDateString";
import { parseAttendance } from "../utils/parseAttendance";

export async function getAttendanceByDate(
  date: AttendanceDateString,
  userId?: string,
): Promise<Attendance | null> {
  if (!userId) {
    const response = await apiClient.get<AttendanceApiModel>({
      url: `/personnel-attendance/get-by-date/${date}`,
    });

    return response.result ? parseAttendance(response.result) : null;
  }

  const response = await apiClient.get<PagedResultApiModel<AttendanceApiModel>>(
    {
      url: `/personnel-attendance?filters=${JSON.stringify({
        userId,
        date,
      })}&sort=${JSON.stringify({ date: "asc" })}&page=0&size=${
        Number.MAX_SAFE_INTEGER
      }`,
    },
  );

  const attendance = response.result.data.at(0);

  return attendance ? parseAttendance(attendance) : null;
}
