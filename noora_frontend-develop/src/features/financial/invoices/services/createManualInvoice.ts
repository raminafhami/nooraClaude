import apiClient from "@/api/client";

import { InvoiceRecipientType } from "../enums/InvoiceRecipientType";
import { InvoiceType } from "../enums/InvoiceType";
import { InvoiceApi } from "../models/Invoice";

type CreateManualInvoiceDto = {
	isFor: string;
	recipient?: {
		refId?: string;
		name: string;
		lastname?: string;
		type?: InvoiceRecipientType;
		nationalCode?: string;
		economicCode?: string;
		registrationNo?: string;
		postalCode?: string;
		phone?: string;
		fax?: string;
		address?: string;
		financialId: string;
	};
	type?: InvoiceType;
	instanceIds: string[];
};

type CreateManualInvoiceApi = {
	isFor?: string;
	recipient?: {
		name: string;
		lastname?: string;
		type?: InvoiceRecipientType;
		nationalCode?: string;
		economyCode?: string;
		registerNo?: string;
		postalCode?: string;
		phone?: string;
		fax?: string;
		address?: string;
		financialId?: string;
	};
	type?: InvoiceType;
	instanceIds: string[];
};
async function createManualInvoice(
	details: CreateManualInvoiceDto,
): Promise<InvoiceApi> {
	const data: CreateManualInvoiceApi = {
		type: details.type || undefined,
		instanceIds: details.instanceIds,
	};

	details.recipient
		? (data.recipient = {
				name: details.recipient?.name?.trim(),
				lastname: details.recipient?.lastname?.trim() || undefined,
				type: details.recipient.type || undefined,
				nationalCode: details.recipient?.nationalCode?.trim() || undefined,
				economyCode: details.recipient?.economicCode?.trim() || undefined,
				registerNo: details.recipient?.registrationNo?.trim() || undefined,
				postalCode: details.recipient?.postalCode?.trim() || undefined,
				phone: details.recipient?.phone?.trim() || undefined,
				fax: details.recipient?.fax?.trim() || undefined,
				address: details.recipient?.address?.trim() || undefined,
				financialId: details.recipient.financialId.trim() || undefined,
			})
		: (data.isFor = details.isFor);

	const response = await apiClient.post<InvoiceApi>({
		url: "invoice/create-invoice-manually",
		body: data,
	});

	return response.result;
}

export { createManualInvoice };
