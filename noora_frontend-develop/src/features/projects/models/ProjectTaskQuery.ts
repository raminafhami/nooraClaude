import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { ProjectTask } from "./ProjectTask";

type ProjectTaskBaseQuery = EntityBaseQuery<
	ProjectTaskQueryFilterParam,
	ProjectTaskQuerySortParam,
	ProjectTaskQueryPopulateParam
>;

type ProjectTaskPageQuery = EntityPageQuery<
	ProjectTaskQueryFilterParam,
	ProjectTaskQuerySortParam,
	ProjectTaskQueryPopulateParam
>;

type ProjectTaskQuery = EntityQuery<
	ProjectTaskQueryFilterParam,
	ProjectTaskQuerySortParam,
	ProjectTaskQueryPopulateParam
>;

type ProjectTaskQueryFilter = Partial<
	EntityQueryFilter<ProjectTaskQueryFilterParam>
>;

type ProjectTaskQueryFilterParam = keyof Omit<ProjectTask, "id"> | "_id";

type ProjectTaskQuerySortParam = keyof Omit<ProjectTask, "id">;

type ProjectTaskQueryPopulateParam =
	| "status"
	| "assignee"
	| "project"
	| "labels"
	| "createdBy";

export type {
	ProjectTaskBaseQuery,
	ProjectTaskPageQuery,
	ProjectTaskQuery,
	ProjectTaskQueryFilter,
	ProjectTaskQueryFilterParam,
	ProjectTaskQueryPopulateParam,
	ProjectTaskQuerySortParam,
};
