import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { CategoryBudget } from "./CategoryBudget";

type CategoryBudgetBaseQuery = EntityBaseQuery<
	CategoryBudgetQueryFilterParam,
	CategoryBudgetQuerySortParam,
	CategoryBudgetQueryPopulateParam
>;

type CategoryBudgetPageQuery = EntityPageQuery<
	CategoryBudgetQueryFilterParam,
	CategoryBudgetQuerySortParam,
	CategoryBudgetQueryPopulateParam
>;

type CategoryBudgetQuery = EntityQuery<
	CategoryBudgetQueryFilterParam,
	CategoryBudgetQuerySortParam,
	CategoryBudgetQueryPopulateParam
>;

type CategoryBudgetQueryFilter = Partial<
	EntityQueryFilter<CategoryBudgetQueryFilterParam>
>;

type CategoryBudgetQueryFilterParam = keyof CategoryBudget;

type CategoryBudgetQuerySortParam = keyof CategoryBudget;

type CategoryBudgetQueryPopulateParam = "userId" | "createdBy" | "updatedBy";

export type {
	CategoryBudgetBaseQuery,
	CategoryBudgetPageQuery,
	CategoryBudgetQuery,
	CategoryBudgetQueryFilter,
	CategoryBudgetQueryFilterParam,
	CategoryBudgetQueryPopulateParam,
	CategoryBudgetQuerySortParam,
};
