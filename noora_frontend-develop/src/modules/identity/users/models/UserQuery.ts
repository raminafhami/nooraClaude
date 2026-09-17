import { User, UserApi } from "./User";

export interface UserBaseQuery {
	filters?: UserQueryFilter;
	sort?: Partial<UserQuerySort>;
	populate?: UserQueryPopulate[];
	projection?: UserQueryProjection[];
}

export interface UserPagedQuery extends UserBaseQuery {
	pagination: { page: number; pageSize: number };
}

export type UserQuery = Partial<UserPagedQuery>;

export type UserQueryFilter = Partial<{
	[key in keyof User | (string & {})]: any;
}>;

export type UserQuerySort = {
	[key in UserQuerySortParam]: "asc" | "desc";
};

export type UserQuerySortParam = keyof User | (string & {});

export type UserQueryPopulate = "groups" | "userFiles";

export type UserQueryProjection = keyof Exclude<UserApi, "id"> | (string & {});
