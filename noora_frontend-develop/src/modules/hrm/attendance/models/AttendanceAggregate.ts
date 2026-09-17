import { TimeString } from "@/time/TimeString";

export interface AttendanceAggregate {
  personnelId: string;
  personnelName: string;
  missTime: TimeString;
  extraTime: TimeString;
  // missionTime: TimeString;
  totalTime: TimeString;
}

export interface AttendanceAggregateApiModel {
  [key: string]: {
    totalExtra: TimeString;
    totalMiss: TimeString;
    totalDuration: TimeString;
    name: string;
    lastname: string;
  };
}
