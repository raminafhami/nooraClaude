import apiClient from "@/api/client";

import { AttendanceDateString } from "../models/AttendanceDateString";
import {
  AttendanceGeneralReport,
  AttendanceGeneralReportApiModel,
} from "../models/AttendanceGeneralReport";
import { parseAttendance } from "../utils/parseAttendance";

export async function getAttendanceGeneralReport(
  dateFrom: AttendanceDateString,
  dateTo: AttendanceDateString,
): Promise<AttendanceGeneralReport> {
  const response = await apiClient.post<AttendanceGeneralReportApiModel>({
    url: `/personnel-attendance/get-report?dateFrom=${dateFrom}&dateTo=${dateTo}&page=0&size=${
      Number.MAX_SAFE_INTEGER
    }&sort=${"date"}`,
  });

  const result: AttendanceGeneralReport = {
    data: parseAttendance(response.result.data),
    totalMiss: response.result.totalMiss,
    totalExtra: response.result.totalExtra,
    totalDuration: response.result.totalDuration,
  };

  return result;
}
