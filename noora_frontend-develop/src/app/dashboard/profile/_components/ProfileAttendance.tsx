"use client";

import { AttendanceProvider } from "@/hrm/attendance/contexts/AttendanceContext";

import { AttendanceInformation } from "./ProfileAttendance/AttendanceInformation";

export function ProfileAttendance(): React.ReactNode {
  return (
    <AttendanceProvider>
      <AttendanceInformation />
    </AttendanceProvider>
  );
}
