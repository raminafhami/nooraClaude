import { JobDescription } from "./Job";

export interface JobBaseQuery {
  filters?: Partial<JobQueryFilter>;
  sort?: Partial<JobQuerySort>;
  populate?: JobQueryPopulate[];
}

export interface JobPagedQuery extends JobBaseQuery {
  pagination: { page: number; pageSize: number };
}

export type JobQuery = Partial<JobPagedQuery>;

export type JobQueryFilter = {
  [key in keyof JobDescription | (string & {})]: any;
};

export type JobQuerySort = {
  [key in JobQuerySortParam]: "asc" | "desc";
};

export type JobQuerySortParam = keyof JobDescription | (string & {});

export type JobQueryPopulate = "requirements.expertises";
