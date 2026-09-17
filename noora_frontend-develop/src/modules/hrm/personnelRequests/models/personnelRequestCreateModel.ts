import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { TimeString } from "@/time/TimeString";
import { PersonnelRequestType } from "./personnelRequestType";

export interface PersonnelRequestCreateModel {
  dateFrom: AttendanceDateString;
  dateTo: AttendanceDateString;
  timeFrom?: TimeString;
  timeTo?: TimeString;
  type: PersonnelRequestType;
  entitlement: boolean;
  description?: string;
  substitute?: string;
  deputyId?: string;
}
