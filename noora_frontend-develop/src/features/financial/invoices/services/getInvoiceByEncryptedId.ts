import apiClient from "@/api/client";

import { InvoiceApi } from "../models/Invoice";

type GetInvoiceByEncryptedIdDto = {
	download?: "html" | "pdf";
};

async function getInvoiceByEncryptedId(
	encryptedId: string,
): Promise<InvoiceApi>;

async function getInvoiceByEncryptedId(
	encryptedId: string,
	details: Omit<GetInvoiceByEncryptedIdDto, "download"> & { download: "html" },
): Promise<string>;

async function getInvoiceByEncryptedId(
	encryptedId: string,
	details: Omit<GetInvoiceByEncryptedIdDto, "download"> & { download: "pdf" },
): Promise<Blob>;

async function getInvoiceByEncryptedId(
	encryptedId: string,
	{ download }: GetInvoiceByEncryptedIdDto = {},
): Promise<InvoiceApi | Blob | string> {
	const options = {
		url: "invoice/invoice-detail/data",
		searchParams: {
			encryptedData: encryptedId,
		},
	};

	if (download === "html") {
		return await apiClient.send({
			...options,
			searchParams: { ...options.searchParams, download: "html" },
			responseType: "text",
		});
	} else if (download === "pdf") {
		return await apiClient.send({
			...options,
			searchParams: { ...options.searchParams, download: "pdf" },
			responseType: "blob",
		});
	}

	const response = await apiClient.get<InvoiceApi>(options);
	return response.result;
}

export { getInvoiceByEncryptedId };
