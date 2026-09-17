import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { InvoiceApi } from "../models/Invoice";
import {
  InvoiceBaseQuery,
  InvoicePageQuery,
  InvoiceQuery,
} from "../models/InvoiceQuery";

async function getInstanceInvoices(
	instanceId: string,
	options?: InvoiceBaseQuery,
): Promise<InvoiceApi[]>;

async function getInstanceInvoices(
	instanceId: string,
	options: InvoicePageQuery,
): Promise<EntityPageResult<InvoiceApi>>;

async function getInstanceInvoices(
	instanceId: string,
	options: InvoiceQuery = {},
): Promise<InvoiceApi[] | EntityPageResult<InvoiceApi>> {
	const response = await apiClient.query<InvoiceApi>({
		url: `invoice/instances/${instanceId}`,
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

export { getInstanceInvoices };
