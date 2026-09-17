import { TimeShortString, TimeString } from "./TimeString";

export function getTimeString(time: Date | number): TimeString;
export function getTimeString(
  time: Date | number | TimeString,
  seconds: false
): TimeShortString;
export function getTimeString(
  time: Date | number | TimeString,
  seconds: boolean = true
): TimeString | TimeShortString {
  if (typeof time === "string") {
    if (seconds) {
      return time;
    }

    return time.split(":").slice(0, 2).join(":") as TimeShortString;
  }

  let hour: number, min: number, sec: number;

  if (time instanceof Date) {
    hour = time.getHours();
    min = time.getMinutes();
    sec = time.getSeconds();
  } else {
    let t = time;

    hour = Math.floor(t / (1000 * 60 * 60));
    t -= hour * (1000 * 60 * 60);
    min = Math.floor(t / (1000 * 60));
    t -= min * (1000 * 60);
    sec = Math.floor(t / 1000);
  }

  let result = `${hour.toString().padStart(2, "0")}:${min
    .toString()
    .padStart(2, "0")}`;

  if (!seconds) {
    return result as TimeShortString;
  }

  return `${result}:${sec.toString().padStart(2, "0")}` as TimeString;
}
