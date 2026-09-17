import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { DispatcherCategory } from "./DispatcherCategory";

type DispatcherCategoryBaseQuery = EntityBaseQuery<
	DispatcherCategoryQueryFilterParam,
	DispatcherCategoryQuerySortParam,
	DispatcherCategoryQueryPopulateParam
>;

type DispatcherCategoryPageQuery = EntityPageQuery<
	DispatcherCategoryQueryFilterParam,
	DispatcherCategoryQuerySortParam,
	DispatcherCategoryQueryPopulateParam
>;

type DispatcherCategoryQuery = EntityQuery<
	DispatcherCategoryQueryFilterParam,
	DispatcherCategoryQuerySortParam,
	DispatcherCategoryQueryPopulateParam
>;

type DispatcherCategoryQueryFilter = Partial<
	EntityQueryFilter<DispatcherCategoryQueryFilterParam>
>;

type DispatcherCategoryQueryFilterParam = keyof DispatcherCategory | "_id";

type DispatcherCategoryQuerySortParam = keyof DispatcherCategory;

type DispatcherCategoryQueryPopulateParam = "";

export type {
	DispatcherCategoryBaseQuery,
	DispatcherCategoryPageQuery,
	DispatcherCategoryQuery,
	DispatcherCategoryQueryFilter,
	DispatcherCategoryQueryFilterParam,
	DispatcherCategoryQueryPopulateParam,
	DispatcherCategoryQuerySortParam,
};
