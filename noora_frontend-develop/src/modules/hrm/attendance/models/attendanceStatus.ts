export enum AttendanceStatus {
  absence = "absence",
  completed = "completed",
  working = "working",
}

export const attendanceStatus: { [key in AttendanceStatus]: string } = {
  [AttendanceStatus.absence]: "غایب",
  [AttendanceStatus.working]: "در حال کار",
  [AttendanceStatus.completed]: "اتمام کار",
};
