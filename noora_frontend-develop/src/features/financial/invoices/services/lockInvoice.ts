import apiClient from "@/api/client";

async function lockInvoice(id: string): Promise<void> {
	await apiClient.patch({
		url: `invoice/pending/${id}`,
	});
}

export { lockInvoice };
