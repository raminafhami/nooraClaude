import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { Activity } from "./Activity";

type ActivityBaseQuery = EntityBaseQuery<
	ActivityQueryFilterParam,
	ActivityQuerySortParam,
	ActivityQueryPopulateParam
>;

type ActivityPageQuery = EntityPageQuery<
	ActivityQueryFilterParam,
	ActivityQuerySortParam,
	ActivityQueryPopulateParam
>;

type ActivityQuery = EntityQuery<
	ActivityQueryFilterParam,
	ActivityQuerySortParam,
	ActivityQueryPopulateParam
>;

type ActivityQueryFilter = Partial<EntityQueryFilter<ActivityQueryFilterParam>>;

type ActivityQueryFilterParam = keyof Omit<Activity, "id"> | "_id";

type ActivityQuerySortParam = keyof Omit<Activity, "id">;

type ActivityQueryPopulateParam =
	| "status"
	| "assignee"
	| "project"
	| "labels"
	| "buyerId"
	| "createdBy";

export type {
	ActivityBaseQuery,
	ActivityPageQuery,
	ActivityQuery,
	ActivityQueryFilter,
	ActivityQueryFilterParam,
	ActivityQueryPopulateParam,
	ActivityQuerySortParam,
};
