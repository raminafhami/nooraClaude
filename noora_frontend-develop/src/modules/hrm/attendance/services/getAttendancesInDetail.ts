import apiClient from "@/api/client";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import { PagedResultApiModel } from "@/models";

import { Attendance, AttendanceApiModel } from "../models/Attendance";
import { AttendanceDateString } from "../models/AttendanceDateString";
import { parseAttendance } from "../utils/parseAttendance";

export async function getAttendancesInDetail(
  userId: string | undefined,
  dateFrom: AttendanceDateString,
  dateTo: AttendanceDateString,
  sort?: string,
): Promise<Attendance[]> {
  if (userId) {
    const response = await apiClient.get<
      PagedResultApiModel<AttendanceApiModel>
    >({
      url: `/personnel-attendance?filters=${JSON.stringify({
        userId,
        $and: [{ date: { $gte: dateFrom } }, { date: { $lte: dateTo } }],
      })}&sort=${JSON.stringify({ date: "asc" })}&page=0&size=${
        Number.MAX_SAFE_INTEGER
      }`,
    });

    return parseAttendance(response.result.data);
  }

  const response = await apiClient.get<PagedResultApiModel<AttendanceApiModel>>(
    {
      url: `/personnel-attendance?filters=${JSON.stringify({
        $and: [{ date: { $gte: dateFrom } }, { date: { $lte: dateTo } }],
      })}&sort=${JSON.stringify(sort ?? {})}&page=0&size=${
        Number.MAX_SAFE_INTEGER
      }`,
    },
  );

  const parsedAttendance = parseAttendance(response.result.data);

  const parsedAttendanceWithName = await Promise.all(
    parsedAttendance.map(async (personnel) => {
      const personnelInfo = await getPersonnelById(personnel.userId, ["user"]);
      return {
        ...personnel,
        fullname: personnelInfo.fullname,
        job: personnelInfo.jobs,
      };
    }),
  );
  return parsedAttendanceWithName;
}
