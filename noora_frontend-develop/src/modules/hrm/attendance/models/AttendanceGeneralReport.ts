import { TimeString } from "@/time/TimeString";
import { Attendance, AttendanceApiModel } from "./Attendance";

export interface AttendanceGeneralReport {
  data: Attendance[];
  totalMiss: TimeString;
  totalExtra: TimeString;
  totalDuration: TimeString;
}

export interface AttendanceGeneralReportApiModel {
  data: AttendanceApiModel[];
  totalMiss: TimeString;
  totalExtra: TimeString;
  totalDuration: TimeString;
}
