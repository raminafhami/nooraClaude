import {
  EntityBaseQuery,
  EntityPageQuery,
  EntityQuery,
  EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { BuyerApi } from "./BuyerApi";

type BuyerBaseQuery = EntityBaseQuery<
  BuyerQueryFilterParam,
  BuyerQuerySortParam,
  BuyerQueryPopulateParam
>;

type BuyerPageQuery = EntityPageQuery<
  BuyerQueryFilterParam,
  BuyerQuerySortParam,
  BuyerQueryPopulateParam
>;

type BuyerQuery = EntityQuery<
  BuyerQueryFilterParam,
  BuyerQuerySortParam,
  BuyerQueryPopulateParam
>;

type BuyerQueryFilter = Partial<EntityQueryFilter<BuyerQueryFilterParam>>;

type BuyerQueryFilterParam = keyof BuyerApi | "_id";

type BuyerQuerySortParam = keyof BuyerApi;

type BuyerQueryPopulateParam = "branches" | "industryId" | "subIndustryId";

export type {
  BuyerBaseQuery,
  BuyerPageQuery,
  BuyerQuery,
  BuyerQueryFilter,
  BuyerQueryFilterParam,
  BuyerQueryPopulateParam,
  BuyerQuerySortParam,
};
