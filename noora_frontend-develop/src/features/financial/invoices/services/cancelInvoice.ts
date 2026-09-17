import apiClient from "@/api/client";

async function cancelInvoice(id: string): Promise<void> {
	await apiClient.patch({
		url: `invoice/cancel/${id}`,
	});
}

export { cancelInvoice };
