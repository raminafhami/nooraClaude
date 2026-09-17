import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { IncomeApi } from "./IncomeApi";

type IncomeBaseQuery = EntityBaseQuery<
	IncomeQueryFilterParam,
	IncomeQuerySortParam,
	IncomeQueryPopulateParam
>;

type IncomePageQuery = EntityPageQuery<
	IncomeQueryFilterParam,
	IncomeQuerySortParam,
	IncomeQueryPopulateParam
>;

type IncomeQuery = EntityQuery<
	IncomeQueryFilterParam,
	IncomeQuerySortParam,
	IncomeQueryPopulateParam
>;

type IncomeQueryFilter = Partial<EntityQueryFilter<IncomeQueryFilterParam>>;

type IncomeQueryFilterParam = keyof IncomeApi;

type IncomeQuerySortParam = keyof IncomeApi;

type IncomeQueryPopulateParam = "categoryId" | "createdBy" | "updatedBy";

export type {
	IncomeBaseQuery,
	IncomePageQuery,
	IncomeQuery,
	IncomeQueryFilter,
	IncomeQueryFilterParam,
	IncomeQueryPopulateParam,
	IncomeQuerySortParam,
};
