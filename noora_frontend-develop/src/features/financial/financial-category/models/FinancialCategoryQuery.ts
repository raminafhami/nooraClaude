import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { FinancialCategory } from "./FinancialCategory";

type FinancialCategoryBaseQuery = EntityBaseQuery<
	FinancialCategoryQueryFilterParam,
	FinancialCategoryQuerySortParam,
	FinancialCategoryQueryPopulateParam
>;

type FinancialCategoryPageQuery = EntityPageQuery<
	FinancialCategoryQueryFilterParam,
	FinancialCategoryQuerySortParam,
	FinancialCategoryQueryPopulateParam
>;

type FinancialCategoryQuery = EntityQuery<
	FinancialCategoryQueryFilterParam,
	FinancialCategoryQuerySortParam,
	FinancialCategoryQueryPopulateParam
>;

type FinancialCategoryQueryFilter = Partial<
	EntityQueryFilter<FinancialCategoryQueryFilterParam>
>;

type FinancialCategoryQueryFilterParam = keyof FinancialCategory;

type FinancialCategoryQuerySortParam = keyof FinancialCategory;

type FinancialCategoryQueryPopulateParam = "parentId";

export type {
	FinancialCategoryBaseQuery,
	FinancialCategoryPageQuery,
	FinancialCategoryQuery,
	FinancialCategoryQueryFilter,
	FinancialCategoryQueryFilterParam,
	FinancialCategoryQueryPopulateParam,
	FinancialCategoryQuerySortParam,
};
