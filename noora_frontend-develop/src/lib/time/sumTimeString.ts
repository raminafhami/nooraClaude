import { getTimeString } from "./getTimeString";
import { getTimeStringInParts } from "./getTimeStringInParts";
import { TimeShortString, TimeString } from "./TimeString";

export function sumTimeString(
  timeA: TimeString | TimeShortString,
  timeB: TimeString | TimeShortString
): TimeString;
export function sumTimeString(
  timeA: TimeString | TimeShortString,
  timeB: TimeString | TimeShortString,
  seconds: false
): TimeShortString;
export function sumTimeString(
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

  let sec = (secondsA || 0) + (secondsB || 0);
  let min = minutesA + minutesB;
  let hour = hoursA + hoursB;

  if (sec >= 60) {
    sec %= 60;
    min++;
  }

  if (min >= 60) {
    min %= 60;
    hour++;
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
