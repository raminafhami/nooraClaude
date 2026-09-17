import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { InvoiceApi } from "./Invoice";

type InvoiceBaseQuery = EntityBaseQuery<
	InvoiceQueryFilterParam,
	InvoiceQuerySortParam,
	InvoiceQueryPopulateParam,
	InvoiceQueryProjectionParam
>;

type InvoicePageQuery = EntityPageQuery<
	InvoiceQueryFilterParam,
	InvoiceQuerySortParam,
	InvoiceQueryPopulateParam,
	InvoiceQueryProjectionParam
>;

type InvoiceQuery = EntityQuery<
	InvoiceQueryFilterParam,
	InvoiceQuerySortParam,
	InvoiceQueryPopulateParam,
	InvoiceQueryProjectionParam
>;

type InvoiceQueryFilter = Partial<EntityQueryFilter<InvoiceQueryFilterParam>>;

type InvoiceQueryFilterParam = keyof InvoiceApi;

type InvoiceQuerySortParam = keyof InvoiceApi;

type InvoiceQueryPopulateParam =
	| "items"
	| "createdBy"
	| "updatedBy"
	| "issuedBy";

type InvoiceQueryProjectionParam = keyof InvoiceApi;

export type {
	InvoiceBaseQuery,
	InvoicePageQuery,
	InvoiceQuery,
	InvoiceQueryFilter,
	InvoiceQueryFilterParam,
	InvoiceQuerySortParam,
	InvoiceQueryPopulateParam,
	InvoiceQueryProjectionParam,
};
