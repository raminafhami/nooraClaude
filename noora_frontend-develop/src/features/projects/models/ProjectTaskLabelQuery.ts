import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { ProjectTaskLabel } from "./ProjectTaskLabel";

type ProjectTaskLabelBaseQuery = EntityBaseQuery<
	ProjectTaskLabelQueryFilterParam,
	ProjectTaskLabelQuerySortParam,
	ProjectTaskLabelQueryPopulateParam
>;

type ProjectTaskLabelPageQuery = EntityPageQuery<
	ProjectTaskLabelQueryFilterParam,
	ProjectTaskLabelQuerySortParam,
	ProjectTaskLabelQueryPopulateParam
>;

type ProjectTaskLabelQuery = EntityQuery<
	ProjectTaskLabelQueryFilterParam,
	ProjectTaskLabelQuerySortParam,
	ProjectTaskLabelQueryPopulateParam
>;

type ProjectTaskLabelQueryFilter = Partial<
	EntityQueryFilter<ProjectTaskLabelQueryFilterParam>
>;

type ProjectTaskLabelQueryFilterParam =
	| keyof Omit<ProjectTaskLabel, "id">
	| "_id";

type ProjectTaskLabelQuerySortParam = keyof Omit<ProjectTaskLabel, "id">;

type ProjectTaskLabelQueryPopulateParam = never;

export type {
	ProjectTaskLabelBaseQuery,
	ProjectTaskLabelPageQuery,
	ProjectTaskLabelQuery,
	ProjectTaskLabelQueryFilter,
	ProjectTaskLabelQueryFilterParam,
	ProjectTaskLabelQueryPopulateParam,
	ProjectTaskLabelQuerySortParam,
};
