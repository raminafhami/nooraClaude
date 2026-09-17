export enum AttendanceEntryType {
  ClockIn = "clock-in",
  ClockOut = "clock-out",
}

export const attendanceEntryType: { [key in AttendanceEntryType]: string } = {
  [AttendanceEntryType.ClockIn]: "ورود",
  [AttendanceEntryType.ClockOut]: "خروج",
};
