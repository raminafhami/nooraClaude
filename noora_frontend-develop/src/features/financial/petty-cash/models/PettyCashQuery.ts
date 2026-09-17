import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { PettyCashApi } from "./PettyCash";

type PettyCashBaseQuery = EntityBaseQuery<
	PettyCashQueryFilterParam,
	PettyCashQuerySortParam,
	PettyCashQueryPopulateParam
>;

type PettyCashPageQuery = EntityPageQuery<
	PettyCashQueryFilterParam,
	PettyCashQuerySortParam,
	PettyCashQueryPopulateParam
>;

type PettyCashQuery = EntityQuery<
	PettyCashQueryFilterParam,
	PettyCashQuerySortParam,
	PettyCashQueryPopulateParam
>;

type PettyCashQueryFilter = Partial<
	EntityQueryFilter<PettyCashQueryFilterParam>
>;
type PettyCashQueryFilterParam = keyof PettyCashApi;
type PettyCashQuerySortParam = keyof PettyCashApi;
type PettyCashQueryPopulateParam = "userId" | "createdBy" | "updatedBy";

export type {
	PettyCashBaseQuery,
	PettyCashPageQuery,
	PettyCashQuery,
	PettyCashQueryFilter,
	PettyCashQueryFilterParam,
	PettyCashQueryPopulateParam,
	PettyCashQuerySortParam,
};
