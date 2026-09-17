import { getTimeStringInParts } from "./getTimeStringInParts";
import { TimeShortString, TimeString } from "./TimeString";

export function getTimeStringInNum(
  time: TimeString | TimeShortString,
  scale: "s" | "ms" = "ms"
): number {
  const { hours, minutes, seconds } = getTimeStringInParts(time);
  const result =
    parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);

  if (scale === "ms") {
    return result * 1000;
  }

  return result;
}
