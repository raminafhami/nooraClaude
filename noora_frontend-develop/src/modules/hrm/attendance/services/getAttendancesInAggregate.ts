import apiClient from "@/api/client";

import {
  AttendanceAggregate,
  AttendanceAggregateApiModel,
} from "../models/AttendanceAggregate";
import { AttendanceDateString } from "../models/AttendanceDateString";

export async function getAttendancesInAggregate(
  dateFrom: AttendanceDateString,
  dateTo: AttendanceDateString,
): Promise<AttendanceAggregate[]> {
  const response = await apiClient.post<AttendanceAggregateApiModel>({
    url: `/personnel-attendance/personnel-general-report?dateFrom=${dateFrom}&dateTo=${dateTo}&page=0&size=${Number.MAX_SAFE_INTEGER}`,
  });

  return ((result) =>
    Object.keys(result).map((key) => ({
      personnelId: key,
      personnelName: `${result[key].name} ${result[key].lastname}`,
      extraTime: result[key].totalExtra,
      missTime: result[key].totalMiss,
      totalTime: result[key].totalDuration,
    })))(response.result);
}
