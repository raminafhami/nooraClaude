import { InstanceApi } from "./InstanceApi";

export interface InstanceBaseQuery {
	filters: InstanceQueryFilter[];
	sort?: Partial<InstanceQuerySort>;
	props?: string[];
	populate?: string[];
}

export interface InstancePagedQuery extends InstanceBaseQuery {
	page: number | { no: number; size: number };
}

export type InstanceQuery = Partial<InstancePagedQuery>;

export interface InstanceQueryFilter {
	name: InstanceQueryFilterParam;
	value: any;
	type?: "match" | "search";
}

export type InstanceQueryFilterParam = keyof InstanceDb | (string & {});

export type InstanceQuerySort = {
	[key in InstanceQuerySortParam]: "asc" | "desc";
};

export type InstanceQuerySortParam = keyof InstanceDb;

interface InstanceDb extends Omit<InstanceApi, "_id"> {
	id: string;
}
