import apiClient from "@/api/client";

import { InvoiceApi } from "../models/Invoice";
import { InvoiceRecipient } from "../models/InvoiceRecipient";

type ForceUpdateInvoiceDto = Partial<{
	description: string;
	title: string;
	issueNo: string;
	issuedAt: string;
	items: string[];
	financialDocumentId: string;
	recipient: InvoiceRecipient;
}>;

type ForceUpdateInvoiceApi = Partial<{
	description: string;
	title: string;
	issueNo: string;
	issuedAt: string;
	items: string[];
	financialDocumentId: string;
	recipient: InvoiceRecipient;
}>;

async function forceUpdateInvoice(
	id: string,
	details: ForceUpdateInvoiceDto,
): Promise<InvoiceApi> {
	const data: ForceUpdateInvoiceApi = {
		description: details.description ? details.description : undefined,
		title: details.title,
		items: details.items,
		issueNo: details.issueNo ? details.issueNo : undefined,
		issuedAt: details.issuedAt,
		financialDocumentId: details.financialDocumentId
			? details.financialDocumentId
			: undefined,
		recipient: details.recipient,
	};

	const response = await apiClient.patch<InvoiceApi>({
		url: `invoice/force-update/${id}`,
		body: data,
	});

	return response.result;
}

export { forceUpdateInvoice };
