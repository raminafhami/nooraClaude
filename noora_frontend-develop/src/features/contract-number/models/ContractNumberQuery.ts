import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { ContractNumber } from "./ContractNumber";

type ContractNumberBaseQuery = EntityBaseQuery<
	ContractNumberQueryFilterParam,
	ContractNumberQuerySortParam,
	ContractNumberQueryPopulateParam
>;

type ContractNumberPageQuery = EntityPageQuery<
	ContractNumberQueryFilterParam,
	ContractNumberQuerySortParam,
	ContractNumberQueryPopulateParam
>;

type ContractNumberQuery = EntityQuery<
	ContractNumberQueryFilterParam,
	ContractNumberQuerySortParam,
	ContractNumberQueryPopulateParam
>;

type ContractNumberQueryFilter = Partial<
	EntityQueryFilter<ContractNumberQueryFilterParam>
>;

type ContractNumberQueryFilterParam = keyof ContractNumber | "_id";

type ContractNumberQuerySortParam = keyof ContractNumber;

type ContractNumberQueryPopulateParam =
	| "branchId"
	| "buyerId"
	| "customerId"
	| "createdBy";

export type {
	ContractNumberBaseQuery,
	ContractNumberPageQuery,
	ContractNumberQuery,
	ContractNumberQueryFilter,
	ContractNumberQueryFilterParam,
	ContractNumberQueryPopulateParam,
	ContractNumberQuerySortParam,
};
