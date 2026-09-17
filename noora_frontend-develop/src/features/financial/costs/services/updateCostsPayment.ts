import apiClient from "@/api/client";

interface UpdateCostsPaymentModel {
	costIds: string[];
	payment: {
		instanceId: string;
		caseNo: string;
	};
}

interface UpdateCostsPaymentApiModel {
	ids: string[];
	caseId: string;
	caseNo: string;
}

async function updateCostsPayment(
	details: UpdateCostsPaymentModel,
): Promise<boolean> {
	const data: UpdateCostsPaymentApiModel = {
		ids: details.costIds,
		caseId: details.payment.instanceId,
		caseNo: details.payment.caseNo,
	};

	await apiClient.post<string>({
		url: "/inspection-costs/payments",
		body: data,
	});

	return true;
}

export { updateCostsPayment };
