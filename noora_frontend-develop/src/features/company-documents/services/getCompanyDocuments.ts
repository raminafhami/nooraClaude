import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { CompanyDocument } from "../models/CompanyDocument";
import {
	CompanyDocumentBaseQuery,
	CompanyDocumentPageQuery,
	CompanyDocumentQuery,
} from "../models/CompanyDocumentQuery";

async function getCompanyDocuments(
	options?: CompanyDocumentBaseQuery,
): Promise<CompanyDocument[]>;

async function getCompanyDocuments(
	options: CompanyDocumentPageQuery,
): Promise<EntityPageResult<CompanyDocument>>;

async function getCompanyDocuments(
	options: CompanyDocumentQuery = {},
): Promise<CompanyDocument[] | EntityPageResult<CompanyDocument>> {
	const response = await apiClient.query<CompanyDocument>({
		url: "company-files",
		queryOptions: options,
	});

	if (!options.pagination) {
		return response.result.data;
	}

	return {
		items: response.result.data,
		page: options.pagination.page,
		pageSize: options.pagination.pageSize,
		total: response.result.count,
	};
}

export { getCompanyDocuments };
