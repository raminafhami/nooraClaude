import { AttendanceDateString } from "../models/AttendanceDateString";

export function toAttendanceDateString(date: Date): AttendanceDateString {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(2, "0")}` as AttendanceDateString;
}
