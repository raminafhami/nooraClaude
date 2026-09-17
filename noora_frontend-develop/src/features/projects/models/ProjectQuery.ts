import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { Project } from "./Project";

type ProjectBaseQuery = EntityBaseQuery<
	ProjectQueryFilterParam,
	ProjectQuerySortParam,
	ProjectQueryPopulateParam
>;

type ProjectPageQuery = EntityPageQuery<
	ProjectQueryFilterParam,
	ProjectQuerySortParam,
	ProjectQueryPopulateParam
>;

type ProjectQuery = EntityQuery<
	ProjectQueryFilterParam,
	ProjectQuerySortParam,
	ProjectQueryPopulateParam
>;

type ProjectQueryFilter = Partial<EntityQueryFilter<ProjectQueryFilterParam>>;

type ProjectQueryFilterParam = keyof Omit<Project, "id"> | "_id";

type ProjectQuerySortParam = keyof Omit<Project, "id">;

type ProjectQueryPopulateParam = "members" | "createdBy";

export type {
	ProjectBaseQuery,
	ProjectPageQuery,
	ProjectQuery,
	ProjectQueryFilter,
	ProjectQueryFilterParam,
	ProjectQueryPopulateParam,
	ProjectQuerySortParam,
};
