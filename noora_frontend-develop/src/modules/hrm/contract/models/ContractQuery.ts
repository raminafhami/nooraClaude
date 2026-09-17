import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { ContractApi } from "./ContractApi";

type ContractBaseQuery = EntityBaseQuery<
	ContractQueryFilterParam,
	ContractQuerySortParam,
	ContractQueryPopulateParam
>;

type ContractPageQuery = EntityPageQuery<
	ContractQueryFilterParam,
	ContractQuerySortParam,
	ContractQueryPopulateParam
>;

type ContractQuery = EntityQuery<
	ContractQueryFilterParam,
	ContractQuerySortParam,
	ContractQueryPopulateParam
>;

type ContractQueryFilter = Partial<EntityQueryFilter<ContractQueryFilterParam>>;

type ContractQueryFilterParam = keyof Omit<ContractApi, "id">;

type ContractQuerySortParam = keyof ContractApi;

type ContractQueryPopulateParam = "";

export type {
	ContractBaseQuery,
	ContractPageQuery,
	ContractQuery,
	ContractQueryFilter,
	ContractQueryFilterParam,
	ContractQueryPopulateParam,
	ContractQuerySortParam,
};
