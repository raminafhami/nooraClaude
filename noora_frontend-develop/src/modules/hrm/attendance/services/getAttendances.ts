import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models";

import { Attendance, AttendanceApiModel } from "../models/Attendance";
import {
  AttendanceBaseQuery,
  AttendancePagedQuery,
  AttendanceQuery,
} from "../models/AttendanceQuery";
import { parseAttendance } from "../utils/parseAttendance";

export async function getAttendances(
  options?: Partial<AttendanceBaseQuery>,
): Promise<Attendance[]>;
export async function getAttendances(
  options?: Partial<AttendancePagedQuery>,
): Promise<PagedResult<Attendance>>;
export async function getAttendances(
  options: AttendanceQuery = {},
): Promise<Attendance[] | PagedResult<Attendance>> {
  let page: number = options.pagination?.page ?? 0;
  let pageSize: number =
    options.pagination?.pageSize ?? Number.MAX_SAFE_INTEGER;

  const response = await apiClient.get<PagedResultApiModel<AttendanceApiModel>>(
    {
      url: `/personnel-attendance?page=${page}&size=${pageSize}&filters=${JSON.stringify(
        options.filters ?? {},
      )}&sort=${
        Object.keys(options.sort ?? {}).length !== 0
          ? JSON.stringify(options.sort)
          : ""
      }&populate=${options.populate?.join(",") || ""}`,
    },
  );

  if (!options.pagination) {
    return parseAttendance(response.result.data);
  }

  return new PagedResult(
    parseAttendance(response.result.data),
    page,
    pageSize,
    response.result.count,
  );
}
