import apiClient from "@/api/client";

async function sendInvoiceBySms(id: string, phoneNo: string): Promise<void> {
	await apiClient.post({
		url: `invoice/${id}/notify-sms`,
		body: {
			phoneNo,
		},
	});
}

export { sendInvoiceBySms };
