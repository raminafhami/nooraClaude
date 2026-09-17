import { useContext } from "react";

import {
  AttendanceContext,
  AttendanceContextType,
} from "../contexts/AttendanceContext";

export function useAttendanceContext(): AttendanceContextType {
  const context = useContext(AttendanceContext);

  if (!context) {
    throw new Error();
  }

  return context;
}
