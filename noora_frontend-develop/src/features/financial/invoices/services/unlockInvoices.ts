import apiClient from "@/api/client";

type UnlockInvoicesApi = {
	invoiceIds: string[];
};

async function unlockInvoices(ids: string[]): Promise<void> {
	const data: UnlockInvoicesApi = {
		invoiceIds: ids,
	};

	await apiClient.patch({
		url: `invoice/revert-previous-state`,
		body: data,
	});
}

export { unlockInvoices };
