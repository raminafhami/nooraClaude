import apiClient from "@/api/client";

type PayInvoicesDto = { ids: string[]; date: string } & (
	| { voucherNo: string }
	| { slCode: string; dlCode: string; receiptNo: string }
);

type PayInvoicesApi = {
	invoiceIds: string[];
	date: string;
} & (
	| { financialDocumentId: string }
	| { slCode: string; dlCode: string; trackingCode: string }
);

async function payInvoices(details: PayInvoicesDto): Promise<string | number> {
	const data: PayInvoicesApi = {
		invoiceIds: details.ids,
		date: details.date,
		...("voucherNo" in details
			? { financialDocumentId: details.voucherNo }
			: {
					slCode: details.slCode,
					dlCode: details.dlCode,
					trackingCode: details.receiptNo,
				}),
	};

	const response = await apiClient.patch<number>({
		url: "invoice/pay",
		body: data,
	});

	return response.result;
}

export { payInvoices };
