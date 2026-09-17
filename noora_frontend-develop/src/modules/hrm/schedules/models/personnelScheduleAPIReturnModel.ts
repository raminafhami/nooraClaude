import { TimeString } from "@/time/TimeString";

export interface PersonnelScheduleAPIReturnModel {
  date: string; //2023-10-02
  userId: string;
  workingTimeRegulationId: string | null;
  extra: TimeString;
  miss: TimeString;
  duration: TimeString;
  missionDuration: TimeString;
  isHoliday: boolean;
  entriesExits: string;
  status: "absence"; // "absence" || ?? || ??
  _id: string;
  id: string;
}
