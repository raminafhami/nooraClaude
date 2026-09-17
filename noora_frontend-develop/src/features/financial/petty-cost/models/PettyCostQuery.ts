import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { PettyCostApi } from "./PettyCost";

type PettyCostBaseQuery = EntityBaseQuery<
	PettyCostQueryFilterParam,
	PettyCostQuerySortParam,
	PettyCostQueryPopulateParam
>;

type PettyCostPageQuery = EntityPageQuery<
	PettyCostQueryFilterParam,
	PettyCostQuerySortParam,
	PettyCostQueryPopulateParam
>;

type PettyCostQuery = EntityQuery<
	PettyCostQueryFilterParam,
	PettyCostQuerySortParam,
	PettyCostQueryPopulateParam
>;

type PettyCostQueryFilter = Partial<
	EntityQueryFilter<PettyCostQueryFilterParam>
>;
type PettyCostQueryFilterParam = keyof PettyCostApi;
type PettyCostQuerySortParam = keyof PettyCostApi;
type PettyCostQueryPopulateParam = "categoryId" | "createdBy" | "userId";

export type {
	PettyCostBaseQuery,
	PettyCostPageQuery,
	PettyCostQuery,
	PettyCostQueryFilter,
	PettyCostQueryFilterParam,
	PettyCostQueryPopulateParam,
	PettyCostQuerySortParam,
};
