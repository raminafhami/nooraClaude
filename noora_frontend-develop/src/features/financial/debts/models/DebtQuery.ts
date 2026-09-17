import {
  EntityBaseQuery,
  EntityPageQuery,
  EntityQuery,
} from "@/api/models/EntityQuery";

import { DebtApi } from "./DebtApi";

type DebtBaseQuery = EntityBaseQuery<
  DebtQueryFilterParam,
  DebtQuerySortParam,
  DebtQueryPopulateParam
>;

type DebtPageQuery = EntityPageQuery<
  DebtQueryFilterParam,
  DebtQuerySortParam,
  DebtQueryPopulateParam
>;

type DebtQuery = EntityQuery<
  DebtQueryFilterParam,
  DebtQuerySortParam,
  DebtQueryPopulateParam
>;

type DebtQueryFilterParam = keyof DebtApi;

type DebtQuerySortParam = keyof DebtApi;

type DebtQueryPopulateParam = "userId" | "instanceId";

export type {
  DebtBaseQuery,
  DebtPageQuery,
  DebtQuery,
  DebtQueryFilterParam,
  DebtQueryPopulateParam,
  DebtQuerySortParam,
};
