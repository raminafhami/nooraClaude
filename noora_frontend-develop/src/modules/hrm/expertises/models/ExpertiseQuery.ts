import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { Expertise } from "./Expertise";

type ExpertiseBaseQuery = EntityBaseQuery<
	ExpertiseQueryFilterParam,
	ExpertiseQuerySortParam,
	ExpertiseQueryPopulateParam
>;

type ExpertisePageQuery = EntityPageQuery<
	ExpertiseQueryFilterParam,
	ExpertiseQuerySortParam,
	ExpertiseQueryPopulateParam
>;

type ExpertiseQuery = EntityQuery<
	ExpertiseQueryFilterParam,
	ExpertiseQuerySortParam,
	ExpertiseQueryPopulateParam
>;

type ExpertiseQueryFilter = Partial<
	EntityQueryFilter<ExpertiseQueryFilterParam>
>;

type ExpertiseQueryFilterParam = keyof Omit<Expertise, "id">;

type ExpertiseQuerySortParam = keyof Expertise;

type ExpertiseQueryPopulateParam = "";

export type {
	ExpertiseBaseQuery,
	ExpertisePageQuery,
	ExpertiseQuery,
	ExpertiseQueryFilter,
	ExpertiseQueryFilterParam,
	ExpertiseQueryPopulateParam,
	ExpertiseQuerySortParam,
};
