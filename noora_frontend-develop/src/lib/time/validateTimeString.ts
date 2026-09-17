import { TimeShortString, TimeString } from "./TimeString";

export function validateTimeString(
  time: TimeString | TimeShortString
): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time);
}
