import { TimeString } from "@/time/TimeString";

export interface Workshift {
  id: string;
  entryTime: TimeString;
  exitTime: TimeString;
  flexible: TimeString;
  title: string;
  legalExtra: TimeString;
}
