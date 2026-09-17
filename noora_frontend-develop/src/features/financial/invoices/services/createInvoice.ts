import apiClient from "@/api/client";

import { InvoiceRecipientType } from "../enums/InvoiceRecipientType";
import { InvoiceType } from "../enums/InvoiceType";
import { InvoiceApi } from "../models/Invoice";

type CreateInvoiceDto = {
	type?: InvoiceType;
	recipient: {
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
	};
	incomeIds: string[];
	title?: string;
	description?: string;
	expiryAt?: Date | string;
};

type CreateInvoiceApi = {
	type?: InvoiceType;
	recipient: {
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
	};
	incomeIds: string[];
	title?: string;
	description?: string;
	expiryAt?: string;
};

async function createInvoice(details: CreateInvoiceDto): Promise<InvoiceApi> {
	const data: CreateInvoiceApi = {
		type: details.type,
		recipient: {
			refId: details.recipient.refId,
			name: details.recipient.name.trim(),
			lastname: details.recipient.lastname?.trim() || undefined,
			type: details.recipient.type || undefined,
			nationalCode: details.recipient.nationalCode?.trim() || undefined,
			economicCode: details.recipient.economicCode?.trim() || undefined,
			registrationNo: details.recipient.registrationNo?.trim() || undefined,
			postalCode: details.recipient.postalCode?.trim() || undefined,
			phone: details.recipient.phone?.trim() || undefined,
			fax: details.recipient.fax?.trim() || undefined,
			address: details.recipient.address?.trim() || undefined,
		},
		incomeIds: details.incomeIds,
		title: details.title?.trim() || undefined,
		description: details.description?.trim() || undefined,
		expiryAt: details.expiryAt
			? details.expiryAt instanceof Date
				? details.expiryAt.toISOString()
				: details.expiryAt
			: undefined,
	};

	const response = await apiClient.post<InvoiceApi>({
		url: "invoice",
		body: data,
	});

	return response.result;
}

export { createInvoice };
