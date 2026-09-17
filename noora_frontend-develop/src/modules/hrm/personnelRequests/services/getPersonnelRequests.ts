import apiClient from "@/api/client";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { TimeString } from "@/time/TimeString";

import { PersonnelRequestStatusType } from "../models/personnelRequestStatusType";
import { PersonnelRequestType } from "../models/personnelRequestType";

interface PersonnelRequestAPIReturn {
  data: {
    _id: string;
    userId: string;
    dateFrom: AttendanceDateString;
    dateTo: AttendanceDateString;
    timeFrom: TimeString;
    timeTo: TimeString;
    type: PersonnelRequestType;
    status: PersonnelRequestStatusType;
    entitlement: boolean;
    id: string;
    description?: string;
    deputyId?: string;
  }[];
  count: number;
}

export interface PersonnelRequest {
  _id: string;
  userId: string;
  dateFrom: AttendanceDateString;
  dateTo: AttendanceDateString;
  timeFrom: TimeString;
  timeTo: TimeString;
  type: PersonnelRequestType;
  status: PersonnelRequestStatusType;
  entitlement: boolean;
  id: string;
  fullname: string;
  description?: string;
  substitute?: string;
  count: number;
  user: any;
}
export async function getPersonnelRequests({
  dateFrom,
  dateTo,
  userId,
  type,
  status,
  page,
  size,
}: {
  dateFrom?: AttendanceDateString;
  dateTo?: AttendanceDateString;
  userId?: string;
  type?: PersonnelRequestType;
  status?: PersonnelRequestStatusType;
  page?: number;
  size?: number;
}): Promise<PersonnelRequest[]> {
  const filters = {
    ...(dateFrom && { dateFrom: { $gte: dateFrom } }),
    ...(dateTo && { dateTo: { $lte: dateTo } }),
    ...(type && { type }),
    ...(status && { status }),
    ...(userId && { userId }),
  };

  const response: any = await apiClient.get<PersonnelRequestAPIReturn>({
    url: `personnel-request?&page=${page ? page : 0}&size=${
      size ? size : Number.MAX_SAFE_INTEGER
    }&sort=${`{ "status": "desc" }`}&${
      Object.keys(filters).length &&
      "filters=" +
        JSON.stringify({
          ...filters,
        })
    }&populate=user deputy`,
  });

  const count = response.result.count;

  // const parsedPersonnelRequests = await Promise.all(
  //   response.result.data.map(async (personnel) => {
  //     const personnelInfo = await getPersonnelById(personnel.userId, ["user"]);
  //     if (personnel?.deputyId) {
  //       const substituteInfo = await getPersonnelById(personnel.deputyId, [
  //         "user",
  //       ]);
  //       return {
  //         ...personnel,
  //         substitute: substituteInfo.fullname,
  //         fullname: personnelInfo.fullname,
  //         count: count,
  //       };
  //     } else {
  //       return { ...personnel, fullname: personnelInfo.fullname, count };
  //     }
  //   })
  // );

  return response.result;
}
