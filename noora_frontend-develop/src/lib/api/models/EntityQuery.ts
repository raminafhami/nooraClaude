interface EntityBaseQuery<
	TFilter extends string = string,
	TSort extends string = string,
	TPopulate extends string = string,
	TProjection extends string = string,
> {
	filters?: Partial<EntityQueryFilter<TFilter>>;
	sort?: Partial<EntityQuerySort<TSort>>;
	populate?: TPopulate[];
	projection?: TProjection[];
}

interface EntityPageQuery<
	TFilter extends string = string,
	TSort extends string = string,
	TPopulate extends string = string,
	TProjection extends string = string,
> extends EntityBaseQuery<TFilter, TSort, TPopulate, TProjection> {
	pagination: { page: number; pageSize: number };
}

interface EntityQuery<
	TFilter extends string = string,
	TSort extends string = string,
	TPopulate extends string = string,
	TProjection extends string = string,
> extends Partial<EntityPageQuery<TFilter, TSort, TPopulate, TProjection>> {}

type EntityQueryFilter<T extends string> = {
	[key in T | (string & {})]: any;
};

type EntityQuerySort<T extends string> = {
	[key in T | (string & {})]: EntityQuerySortOrder;
};

type EntityQuerySortOrder = "asc" | "desc" | 1 | -1;

export type {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
};
