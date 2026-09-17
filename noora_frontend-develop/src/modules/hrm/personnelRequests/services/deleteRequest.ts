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
  }[];
  count: number;
}

export async function deleteRequest(userId: string) {
  const response = await apiClient.delete<PersonnelRequestAPIReturn>({
    url: `/personnel-request/${userId}`,
  });

  return response.success;
}
