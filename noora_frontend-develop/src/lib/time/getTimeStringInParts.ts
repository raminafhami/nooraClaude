import {
  TimeHour,
  TimeMinuteOrSecond,
  TimeShortString,
  TimeString,
} from "./TimeString";

export function getTimeStringInParts(
  time: TimeString | TimeShortString,
  type?: "string"
): {
  hours: TimeHour;
  minutes: TimeMinuteOrSecond;
  seconds: TimeMinuteOrSecond;
};

export function getTimeStringInParts(
  time: TimeString | TimeShortString,
  type: "number"
): {
  hours: number;
  minutes: number;
  seconds: number;
};

export function getTimeStringInParts(
  time: TimeString | TimeShortString,
  type: "string" | "number" = "string"
):
  | {
      hours: TimeHour;
      minutes: TimeMinuteOrSecond;
      seconds: TimeMinuteOrSecond;
    }
  | {
      hours: number;
      minutes: number;
      seconds: number;
    } {
  const parts = time.split(":");

  if (type === "number") {
    return {
      hours: parseInt(parts[0]),
      minutes: parseInt(parts[1]),
      seconds: parseInt(parts[2] ?? "00"),
    };
  }

  return {
    hours: parts[0] as TimeHour,
    minutes: parts[1] as TimeMinuteOrSecond,
    seconds: (parts[2] ?? "00") as TimeMinuteOrSecond,
  };
}
