import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { PettyCategoryAndBudget } from "./PettyCategoryAndBudget";

type PettyCategoryAndBudgetBaseQuery = EntityBaseQuery<
	PettyCategoryAndBudgetQueryFilterParam,
	PettyCategoryAndBudgetQuerySortParam,
	PettyCategoryAndBudgetQueryPopulateParam
>;

type PettyCategoryAndBudgetPageQuery = EntityPageQuery<
	PettyCategoryAndBudgetQueryFilterParam,
	PettyCategoryAndBudgetQuerySortParam,
	PettyCategoryAndBudgetQueryPopulateParam
>;

type PettyCategoryAndBudgetQuery = EntityQuery<
	PettyCategoryAndBudgetQueryFilterParam,
	PettyCategoryAndBudgetQuerySortParam,
	PettyCategoryAndBudgetQueryPopulateParam
>;

type PettyCategoryAndBudgetQueryFilter = Partial<
	EntityQueryFilter<PettyCategoryAndBudgetQueryFilterParam>
>;
type PettyCategoryAndBudgetQueryFilterParam = keyof PettyCategoryAndBudget;
type PettyCategoryAndBudgetQuerySortParam = keyof PettyCategoryAndBudget;
type PettyCategoryAndBudgetQueryPopulateParam =
	| "userId"
	| "createdBy"
	| "updatedBy";

export type {
	PettyCategoryAndBudgetBaseQuery,
	PettyCategoryAndBudgetPageQuery,
	PettyCategoryAndBudgetQuery,
	PettyCategoryAndBudgetQueryFilter,
	PettyCategoryAndBudgetQueryFilterParam,
	PettyCategoryAndBudgetQueryPopulateParam,
	PettyCategoryAndBudgetQuerySortParam,
};
