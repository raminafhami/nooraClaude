import { ProcessApi } from "./ProcessApi";

export interface ProcessBaseQuery {
  filters?: Partial<ProcessQueryFilter>;
  sort?: Partial<ProcessQuerySort>;
}

export interface ProcessPagedQuery extends ProcessBaseQuery {
  pagination: { page: number; pageSize: number };
}

export type ProcessQuery = Partial<ProcessPagedQuery>;

export type ProcessQueryFilter = {
  [key in keyof ProcessApi | (string & {})]: any;
};

export type ProcessQuerySort = {
  [key in ProcessQuerySortParam]: "asc" | "desc";
};

export type ProcessQuerySortParam = keyof ProcessApi | (string & {});
