import apiClient from "@/api/client";

async function issueInvoice(id: string): Promise<void> {
	await apiClient.patch({
		url: `invoice/issue/${id}`,
	});
}

export { issueInvoice };
