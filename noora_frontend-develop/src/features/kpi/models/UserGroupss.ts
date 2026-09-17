// we have 2 userGroup one of it should be delete

import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";
import { UserGroupApi } from "@/identity/groups/models/Group";

type UserGroupBaseQuery = EntityBaseQuery<
	UserGroupQueryFilterParam,
	UserGroupQuerySortParam,
	UserGroupQueryPopulateParam
>;

type UserGroupPageQuery = EntityPageQuery<
	UserGroupQueryFilterParam,
	UserGroupQuerySortParam,
	UserGroupQueryPopulateParam
>;

type UserGroupQuery = EntityQuery<
	UserGroupQueryFilterParam,
	UserGroupQuerySortParam,
	UserGroupQueryPopulateParam
>;

type UserGroupQueryFilter = Partial<
	EntityQueryFilter<UserGroupQueryFilterParam>
>;
type UserGroupQueryFilterParam = keyof UserGroupApi;
type UserGroupQuerySortParam = keyof UserGroupApi;
type UserGroupQueryPopulateParam = "userId" | "groupId" | "updatedBy";

export type {
	UserGroupBaseQuery,
	UserGroupPageQuery,
	UserGroupQuery,
	UserGroupQueryFilter,
	UserGroupQueryFilterParam,
	UserGroupQueryPopulateParam,
	UserGroupQuerySortParam,
};
