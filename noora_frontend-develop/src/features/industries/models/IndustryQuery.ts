import {
  EntityBaseQuery,
  EntityPageQuery,
  EntityQuery,
} from "@/api/models/EntityQuery";

import { IndustryApi } from "./IndustryApi";

type IndustryBaseQuery = EntityBaseQuery<
  IndustryQueryFilterParam,
  IndustryQuerySortParam,
  IndustryQueryPopulateParam
>;

type IndustryPageQuery = EntityPageQuery<
  IndustryQueryFilterParam,
  IndustryQuerySortParam,
  IndustryQueryPopulateParam
>;

type IndustryQuery = EntityQuery<
  IndustryQueryFilterParam,
  IndustryQuerySortParam,
  IndustryQueryPopulateParam
>;

type IndustryQueryFilterParam = keyof IndustryApi;

type IndustryQuerySortParam = keyof IndustryApi;

type IndustryQueryPopulateParam = "";

export type {
  IndustryBaseQuery,
  IndustryPageQuery,
  IndustryQuery,
  IndustryQueryFilterParam,
  IndustryQueryPopulateParam,
  IndustryQuerySortParam,
};
