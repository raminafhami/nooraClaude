import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { TimeString } from "@/time/TimeString";

export interface ManualTimeCreateModel {
  date: AttendanceDateString;
  entryTime: TimeString;
  exitTime: TimeString;
  userId?: string;
}
