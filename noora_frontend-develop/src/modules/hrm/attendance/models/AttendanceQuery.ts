import { Attendance } from "./Attendance";

export interface AttendanceBaseQuery {
  filters?: Partial<AttendanceQueryFilter>;
  sort?: Partial<AttendanceQuerySort>;
  populate?: AttendanceQueryPopulate[];
}

export interface AttendancePagedQuery extends AttendanceBaseQuery {
  pagination: { page: number; pageSize: number };
}

export type AttendanceQuery = Partial<AttendancePagedQuery>;

export type AttendanceQueryFilter = {
  [key in keyof Attendance | (string & {})]: any;
};

export type AttendanceQuerySort = {
  [key in AttendanceQuerySortParam]: "asc" | "desc";
};

export type AttendanceQuerySortParam = "date";

export type AttendanceQueryPopulate = "user" | "workingTimeRegulation";
