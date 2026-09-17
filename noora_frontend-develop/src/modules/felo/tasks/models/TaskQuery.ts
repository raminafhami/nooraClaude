import {
  EntityBaseQuery,
  EntityPageQuery,
  EntityQuery,
} from "@/api/models/EntityQuery";

import { TaskApi } from "./TaskApi";

type TaskBaseQuery = EntityBaseQuery<
  TaskQueryFilterParam,
  TaskQuerySortParam,
  TaskQueryPopulateParam
>;

type TaskPageQuery = EntityPageQuery<
  TaskQueryFilterParam,
  TaskQuerySortParam,
  TaskQueryPopulateParam
>;

type TaskQuery = EntityQuery<
  TaskQueryFilterParam,
  TaskQuerySortParam,
  TaskQueryPopulateParam
>;

type TaskQueryFilterParam = keyof TaskApi;

type TaskQuerySortParam = keyof TaskApi;

type TaskQueryPopulateParam = "";

export type {
  TaskBaseQuery,
  TaskPageQuery,
  TaskQuery,
  TaskQueryFilterParam,
  TaskQueryPopulateParam,
  TaskQuerySortParam,
};
