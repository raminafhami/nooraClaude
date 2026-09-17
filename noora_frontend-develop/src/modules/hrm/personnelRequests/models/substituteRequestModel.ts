import { TimeString } from "@/time/TimeString";

export type substituteRequestModel =
  | {
      dateFrom: string;
      dateTo: string;
      type: "dailyLeave";
      entitlement: boolean;
      status:
        | "approved"
        | "rejected"
        | "pendingForManager"
        | "pendingForSubstitute";
      id: string;
      substitute: string;
      yourAction: string;
    }
  | {
      dateFrom: string;
      dateTo: string;
      timeFrom: TimeString;
      timeTo: TimeString;
      type: "hourlyLeave";
      entitlement: boolean;
      status: "approved" | "rejected" | "pendingForManager";
      id: string;
      yourAction: string;
    };
