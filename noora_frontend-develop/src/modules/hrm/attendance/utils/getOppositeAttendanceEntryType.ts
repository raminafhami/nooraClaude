import { AttendanceEntryType } from "../models/AttendanceEntryType";

export function getOppositeAttendanceEntryType(
  type: AttendanceEntryType | null
): AttendanceEntryType {
  if (!type || type === AttendanceEntryType.ClockOut) {
    return AttendanceEntryType.ClockIn;
  }

  return AttendanceEntryType.ClockOut;
}
