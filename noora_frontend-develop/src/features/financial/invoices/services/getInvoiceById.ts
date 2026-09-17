import apiClient from "@/api/client";

import { InvoiceApi } from "../models/Invoice";

async function getInvoiceById(id: string): Promise<InvoiceApi> {
	const response = await apiClient.get<InvoiceApi>({
		url: `invoice/${id}`,
	});

	return response.result;
}

export { getInvoiceById };
