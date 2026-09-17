import apiClient from "@/api/client";

import { InvoiceApi } from "../models/Invoice";

type UpdateInvoiceDto = Partial<{
	description: string;
}>;

type UpdateInvoiceApi = Partial<{
	description: string;
}>;

async function updateInvoice(
	id: string,
	details: UpdateInvoiceDto,
): Promise<InvoiceApi> {
	const data: UpdateInvoiceApi = {
		description: details.description,
	};

	const response = await apiClient.patch<InvoiceApi>({
		url: `invoice/${id}`,
		body: data,
	});

	return response.result;
}

export { updateInvoice };
