import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { InvoiceApi } from "../models/Invoice";
import {
  InvoiceBaseQuery,
  InvoicePageQuery,
  InvoiceQuery,
} from "../models/InvoiceQuery";

async function getInvoices(options?: InvoiceBaseQuery): Promise<InvoiceApi[]>;

async function getInvoices(
	options: InvoicePageQuery,
): Promise<EntityPageResult<InvoiceApi>>;

async function getInvoices(
	options: InvoiceQuery = {},
): Promise<InvoiceApi[] | EntityPageResult<InvoiceApi>> {
	const response = await apiClient.query<InvoiceApi>({
		url: "invoice",
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

export { getInvoices };
