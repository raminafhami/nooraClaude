import { UserGroupDb } from "../models/Group";

export interface GroupBaseQuery {
  filters: GroupQueryFilter[];
  sort?: Partial<GroupQuerySort>;
}

export interface GroupPagedQuery extends GroupBaseQuery {
  page: number | { no: number; size: number };
}

export type GroupQuery = Partial<GroupPagedQuery>;

export interface GroupQueryFilter {
  name: GroupQueryFilterParam;
  value: any;
  type?: "match" | "search";
}

export type GroupQueryFilterParam = keyof UserGroupDb | (string & {});

export type GroupQuerySort = {
  [key in GroupQuerySortParam]: "asc" | "desc";
};

export type GroupQuerySortParam = keyof UserGroupDb;
