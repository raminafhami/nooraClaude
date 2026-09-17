import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import { JobDescription, JobDescriptionApi } from "../models/Job";
import { JobBaseQuery, JobPagedQuery, JobQuery } from "../models/JobQuery";
import parseJob from "../utils/parseJob";

export async function getJobs(
  options?: Partial<JobBaseQuery>,
): Promise<JobDescription[]>;
export async function getJobs(
  options?: Partial<JobPagedQuery>,
): Promise<PagedResult<JobDescription>>;
export async function getJobs(
  options: JobQuery = {},
): Promise<JobDescription[] | PagedResult<JobDescription>> {
  let page: number = options.pagination?.page ?? 0;
  let pageSize: number =
    options.pagination?.pageSize ?? Number.MAX_SAFE_INTEGER;

  const response = await apiClient.get<PagedResultApiModel<JobDescriptionApi>>({
    url: `/job-description?page=${page}&size=${pageSize}&filters=${JSON.stringify(
      options.filters ?? {},
    )}&sort=${
      Object.keys(options.sort ?? {}).length !== 0
        ? JSON.stringify(options.sort)
        : ""
    }&populate=${options.populate?.join(",") || ""}`,
  });

  if (!options.pagination) {
    return parseJob(response.result.data);
  }

  return new PagedResult(
    parseJob(response.result.data),
    page,
    pageSize,
    response.result.count,
  );
}
