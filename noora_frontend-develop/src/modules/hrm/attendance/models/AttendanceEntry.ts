import { TimeString } from "@/time/TimeString";

import { AttendanceEntryType } from "./AttendanceEntryType";

export interface AttendanceEntry {
  time: TimeString;
  type: AttendanceEntryType;
}
