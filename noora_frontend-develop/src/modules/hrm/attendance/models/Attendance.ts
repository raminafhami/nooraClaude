import { User, UserApi } from "@/identity/users/models/User";
import { TimeString } from "@/time/TimeString";

import { AttendanceDateString } from "./AttendanceDateString";
import { AttendanceEntry } from "./AttendanceEntry";
import { AttendanceStatus } from "./attendanceStatus";
import { Workshift } from "./Workshift";

export interface Attendance {
  id: string;
  date: AttendanceDateString;
  entries: AttendanceEntry[];
  missTime: TimeString;
  extraTime: TimeString;
  missionTime: TimeString;
  totalTime: TimeString;
  userId: string;
  user?: User;
  workshiftId: string | null;
  workshift?: Workshift | null;
  fullname: string;
  status: AttendanceStatus;
}

export interface AttendanceApiModel {
  _id: string;
  date: AttendanceDateString;
  entryTime?: TimeString;
  exitTime?: TimeString;
  entriesExits: string;
  miss: TimeString;
  extra: TimeString;
  missionDuration: TimeString;
  duration: TimeString;
  userId: string;
  user?: UserApi;
  workingTimeRegulationId: string | null;
  workingTimeRegulation?: Workshift | null;
  status: AttendanceStatus;
}
