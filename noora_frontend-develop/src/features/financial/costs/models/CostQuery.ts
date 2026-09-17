import { Cost } from "./Cost";

export interface CostBaseQuery {
	filters?: Partial<CostQueryFilter>;
	sort?: Partial<CostQuerySort>;
	populate?: CostQueryPopulate[];
}

export interface CostPagedQuery extends CostBaseQuery {
	pagination: { page: number; pageSize: number };
}

export type CostQuery = Partial<CostPagedQuery>;

export type CostQueryFilter = {
	[key in keyof Cost | (string & {})]: any;
};

export type CostQuerySort = {
	[key in CostQuerySortParam]: "asc" | "desc";
};

export type CostQuerySortParam = keyof Cost | (string & {});

export type CostQueryPopulate =
	| "categoryId"
	| "personId"
	| "ruleId"
	| "instance";
