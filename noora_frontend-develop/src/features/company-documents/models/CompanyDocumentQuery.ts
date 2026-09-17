import {
	EntityBaseQuery,
	EntityPageQuery,
	EntityQuery,
	EntityQueryFilter,
} from "@/api/models/EntityQuery";

import { CompanyDocument } from "./CompanyDocument";

type CompanyDocumentBaseQuery = EntityBaseQuery<
	CompanyDocumentQueryFilterParam,
	CompanyDocumentQuerySortParam,
	CompanyDocumentQueryPopulateParam
>;

type CompanyDocumentPageQuery = EntityPageQuery<
	CompanyDocumentQueryFilterParam,
	CompanyDocumentQuerySortParam,
	CompanyDocumentQueryPopulateParam
>;

type CompanyDocumentQuery = EntityQuery<
	CompanyDocumentQueryFilterParam,
	CompanyDocumentQuerySortParam,
	CompanyDocumentQueryPopulateParam
>;

type CompanyDocumentQueryFilter = Partial<
	EntityQueryFilter<CompanyDocumentQueryFilterParam>
>;
type CompanyDocumentQueryFilterParam = keyof CompanyDocument;
type CompanyDocumentQuerySortParam = keyof CompanyDocument;
type CompanyDocumentQueryPopulateParam =
	| "filesList"
	| "assignmentHistoryUsers"
	| "branch";

export type {
	CompanyDocumentBaseQuery,
	CompanyDocumentPageQuery,
	CompanyDocumentQuery,
	CompanyDocumentQueryFilter,
	CompanyDocumentQueryFilterParam,
	CompanyDocumentQueryPopulateParam,
	CompanyDocumentQuerySortParam,
};
