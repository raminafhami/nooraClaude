import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { Property } from "./Property";

type PropertyBaseQuery = EntityBaseQuery<
	PropertyQueryFilterParam,
	PropertyQuerySortParam,
	PropertyQueryPopulateParam
>;

type PropertyPageQuery = EntityPageQuery<
	PropertyQueryFilterParam,
	PropertyQuerySortParam,
	PropertyQueryPopulateParam
>;

type PropertyQuery = EntityQuery<
	PropertyQueryFilterParam,
	PropertyQuerySortParam,
	PropertyQueryPopulateParam
>;

type PropertyQueryFilter = Partial<EntityQueryFilter<PropertyQueryFilterParam>>;
type PropertyQueryFilterParam = keyof Property;
type PropertyQuerySortParam = keyof Property;
type PropertyQueryPopulateParam =
	| "filesList"
	| "assignmentHistoryUsers"
	| "branch";

export type {
	PropertyBaseQuery,
	PropertyPageQuery,
	PropertyQuery,
	PropertyQueryFilter,
	PropertyQueryFilterParam,
	PropertyQueryPopulateParam,
	PropertyQuerySortParam,
};
