import parseUser from "@/identity/users/utils/parseUser";
import { TimeString } from "@/time/TimeString";

import { Attendance, AttendanceApiModel } from "../models/Attendance";
import { AttendanceEntry } from "../models/AttendanceEntry";
import { AttendanceEntryType } from "../models/AttendanceEntryType";
import { getOppositeAttendanceEntryType } from "./getOppositeAttendanceEntryType";

export function parseAttendance(from: AttendanceApiModel): Attendance;
export function parseAttendance(from: AttendanceApiModel[]): Attendance[];
export function parseAttendance(
  from: AttendanceApiModel | AttendanceApiModel[]
): Omit<Attendance, "fullname"> | Omit<Attendance[], "fullname"> {
  if (Array.isArray(from)) {
    return from.map((x) => parseAttendance(x));
  }

  return {
    id: from._id,
    date: from.date,
    entries: (() => {
      const entries: AttendanceEntry[] = [];

      if (!from.entryTime) {
        return entries;
      }
      entries.push({ time: from.entryTime, type: AttendanceEntryType.ClockIn });

      if (!from.exitTime) {
        return entries;
      }
      entries.push({ time: from.exitTime, type: AttendanceEntryType.ClockOut });

      let entryType = AttendanceEntryType.ClockOut;
      (from.entriesExits
        ? (from.entriesExits.replace(",", "").split(",") as TimeString[])
        : []
      ).forEach((entryTime) => {
        entries.push({
          time: entryTime,
          type: (entryType = getOppositeAttendanceEntryType(entryType)),
        });
      });

      return entries;
    })(),
    missTime: from.miss,
    extraTime: from.extra,
    missionTime: from.missionDuration,
    totalTime: from.duration,
    userId: from.userId,
    user: from.user ? parseUser(from.user) : undefined,
    workshiftId: from.workingTimeRegulationId,
    workshift: from.workingTimeRegulation,
    status: from.status,
  };
}
