import { PersonnelDb } from "./Personnel";

export interface PersonnelBaseQuery {
  filters: PersonnelQueryFilter[];
  sort?: Partial<PersonnelQuerySort>;
  populate?: PersonnelQueryPopulate[];
}

export interface PersonnelPagedQuery extends PersonnelBaseQuery {
  page: number | { no: number; size: number };
}

export type PersonnelQuery = Partial<PersonnelPagedQuery>;

export interface PersonnelQueryFilter {
  name: PersonnelQueryFilterParam;
  value: any;
  type?: "match" | "search";
}

export type PersonnelQueryFilterParam =
  | keyof PersonnelDb
  | `user.${keyof PersonnelDb["user"]}`
  | (string & {});

export type PersonnelQuerySort = {
  [key in PersonnelQuerySortParam]: "asc" | "desc";
};

export type PersonnelQuerySortParam =
  | keyof PersonnelDb
  | `user.${keyof PersonnelDb["user"]}`
  | (string & {});

export type PersonnelQueryPopulate =
  | "user"
  | "jobs"
  | "expertises"
  | "user.bankAccountNumber"
  | "user.bankCardNumber"
  | "user.bankSheba"
  | "user.bankAccountOwner";
