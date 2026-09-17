import { BranchDb } from "./Branch";

export interface BranchBaseQuery {
  filters: BranchQueryFilter[];
  sort?: Partial<BranchQuerySort>;
}

export interface BranchPagedQuery extends BranchBaseQuery {
  page: number | { no: number; size: number };
}

export type BranchQuery = Partial<BranchPagedQuery>;

export interface BranchQueryFilter {
  name: BranchQueryFilterParam;
  value: any;
  type?: "match" | "search";
}

export type BranchQueryFilterParam =
  | keyof BranchDb
  | `metadata.${keyof BranchDb["metadata"]}`
  | (string & {});

export type BranchQuerySort = {
  [key in BranchQuerySortParam]: "asc" | "desc";
};

export type BranchQuerySortParam = "id" | "name" | "title";
