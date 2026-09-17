import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { KpiApi } from "./Kpi";

type KpiBaseQuery = EntityBaseQuery<
	KpiQueryFilterParam,
	KpiQuerySortParam,
	KpiQueryPopulateParam
>;

type KpiPageQuery = EntityPageQuery<
	KpiQueryFilterParam,
	KpiQuerySortParam,
	KpiQueryPopulateParam
>;

type KpiQuery = EntityQuery<
	KpiQueryFilterParam,
	KpiQuerySortParam,
	KpiQueryPopulateParam
>;

type KpiQueryFilter = Partial<EntityQueryFilter<KpiQueryFilterParam>>;
type KpiQueryFilterParam = keyof KpiApi;
type KpiQuerySortParam = keyof KpiApi;
type KpiQueryPopulateParam = "userId" | "groupId" | "updatedBy";

export type {
	KpiBaseQuery,
	KpiPageQuery,
	KpiQuery,
	KpiQueryFilter,
	KpiQueryFilterParam,
	KpiQueryPopulateParam,
	KpiQuerySortParam,
};
