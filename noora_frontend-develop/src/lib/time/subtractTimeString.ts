import { getTimeString } from "./getTimeString";
import { getTimeStringInParts } from "./getTimeStringInParts";
import { TimeShortString, TimeString } from "./TimeString";

export function subtractTimeString(
  timeA: TimeString | TimeShortString,
  timeB: TimeString | TimeShortString
): TimeString;
export function subtractTimeString(
  timeA: TimeString | TimeShortString,
  timeB: TimeString | TimeShortString,
  seconds: false
): TimeShortString;
export function subtractTimeString(
  timeA: TimeString | TimeShortString,
  timeB: TimeString | TimeShortString,
  seconds: boolean = true
): TimeString | TimeShortString {
  const {
    hours: hoursA,
    minutes: minutesA,
    seconds: secondsA,
  } = getTimeStringInParts(timeA, "number");
  const {
    hours: hoursB,
    minutes: minutesB,
    seconds: secondsB,
  } = getTimeStringInParts(timeB, "number");

  let sec = secondsA - secondsB;
  let min = minutesA - minutesB;
  let hour = hoursA - hoursB;

  if (sec < 0) {
    min -= 1;
    sec += 60;
  }

  if (min < 0) {
    hour -= 1;
    min += 60;
  }

  if (hour < 0) {
    throw new Error("Second time cannot be greated than the first time.");
  }

  const date = new Date();
  date.setHours(hour);
  date.setMinutes(min);
  date.setSeconds(sec);

  if (!seconds) {
    return getTimeString(date, seconds);
  }

  return getTimeString(date);
}
