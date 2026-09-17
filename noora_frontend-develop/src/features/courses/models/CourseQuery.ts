import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { CourseApi } from "./Course";

type CourseBaseQuery = EntityBaseQuery<
	CourseQueryFilterParam,
	CourseQuerySortParam,
	CourseQueryPopulateParam
>;

type CoursePageQuery = EntityPageQuery<
	CourseQueryFilterParam,
	CourseQuerySortParam,
	CourseQueryPopulateParam
>;

type CourseQuery = EntityQuery<
	CourseQueryFilterParam,
	CourseQuerySortParam,
	CourseQueryPopulateParam
>;

type CourseQueryFilter = Partial<EntityQueryFilter<CourseQueryFilterParam>>;

type CourseQueryFilterParam = keyof CourseApi | "_id";

type CourseQuerySortParam = keyof CourseApi;

type CourseQueryPopulateParam = "users";

export type {
	CourseBaseQuery,
	CoursePageQuery,
	CourseQuery,
	CourseQueryFilter,
	CourseQueryFilterParam,
	CourseQueryPopulateParam,
	CourseQuerySortParam,
};
