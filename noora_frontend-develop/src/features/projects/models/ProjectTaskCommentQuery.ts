import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { ProjectTaskComment } from "./ProjectTaskComment";

type ProjectTaskCommentBaseQuery = EntityBaseQuery<
	ProjectTaskCommentQueryFilterParam,
	ProjectTaskCommentQuerySortParam,
	ProjectTaskCommentQueryPopulateParam
>;

type ProjectTaskCommentPageQuery = EntityPageQuery<
	ProjectTaskCommentQueryFilterParam,
	ProjectTaskCommentQuerySortParam,
	ProjectTaskCommentQueryPopulateParam
>;

type ProjectTaskCommentQuery = EntityQuery<
	ProjectTaskCommentQueryFilterParam,
	ProjectTaskCommentQuerySortParam,
	ProjectTaskCommentQueryPopulateParam
>;

type ProjectTaskCommentQueryFilter = Partial<
	EntityQueryFilter<ProjectTaskCommentQueryFilterParam>
>;

type ProjectTaskCommentQueryFilterParam =
	| keyof Omit<ProjectTaskComment, "id">
	| "_id";

type ProjectTaskCommentQuerySortParam = keyof Omit<ProjectTaskComment, "id">;

type ProjectTaskCommentQueryPopulateParam = never;

export type {
	ProjectTaskCommentBaseQuery,
	ProjectTaskCommentPageQuery,
	ProjectTaskCommentQuery,
	ProjectTaskCommentQueryFilter,
	ProjectTaskCommentQueryFilterParam,
	ProjectTaskCommentQueryPopulateParam,
	ProjectTaskCommentQuerySortParam,
};
