import apiClient from "@/api/client";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import { TimeString } from "@/time/TimeString";

import { PersonnelRequestType } from "../models/personnelRequestType";

export interface MyRequests {
  _id: string;
  userId: string;
  dateFrom: AttendanceDateString;
  dateTo: AttendanceDateString;
  timeFrom: TimeString;
  timeTo: TimeString;
  type: PersonnelRequestType;
  status: "waitingConfirmation" | "counted" | "rejected";
  entitlement?: boolean;
  id: string;
  description?: string;
  substitute?: string;
}

interface MyRequestsAPIReturn {
  data: {
    _id: string;
    userId: string;
    dateFrom: AttendanceDateString;
    dateTo: AttendanceDateString;
    timeFrom: TimeString;
    timeTo: TimeString;
    type: PersonnelRequestType;
    status: "waitingConfirmation" | "counted" | "rejected";
    entitlement: boolean;
    id: string;
    description?: string;
    deputyId?: string;
  }[];
  count: number;
}

export async function getMyRequests(): Promise<MyRequests[]> {
  const response = await apiClient.get<MyRequestsAPIReturn>({
    url: `/personnel-request/get-my-requests?page=0&size=10000&sort=${`{ "dateFrom": "desc" }`}`,
  });

  const parsedPersonnelRequests = await Promise.all(
    response.result.data.map(async (personnel) => {
      if (personnel?.deputyId) {
        const personnelInfo = await getPersonnelById(personnel.deputyId, [
          "user",
        ]);
        return { ...personnel, substitute: personnelInfo.fullname };
      } else {
        return { ...personnel };
      }
    }),
  );

  return parsedPersonnelRequests;
}
