import apiClient from "@/api/client";

async function getCostsReportByPayment(instanceId: string): Promise<Blob> {
	const response = await apiClient.send({
		url: `inspection-costs/payments/${instanceId}`,
		responseType: "blob",
		searchParams: {
			page: 0,
			size: 10,
			populate: "instance",
			download: 1,
		},
	});

	return response;
}

export { getCostsReportByPayment };
