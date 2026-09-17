"use client";

import { getTimeStringInParts } from "./getTimeStringInParts";
import { TimeShortString, TimeString } from "./TimeString";

export function getTimeStringInDate(time: TimeString | TimeShortString): Date {
  const { hours, minutes, seconds } = getTimeStringInParts(time);

  const date = new Date();
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  date.setSeconds(parseInt(seconds));

  return date;
}
