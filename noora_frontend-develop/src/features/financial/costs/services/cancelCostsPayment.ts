import apiClient from "@/api/client";

interface CancelCostsPaymentModel {
	instanceId: string;
}

async function cancelCostsPayment(
	details: CancelCostsPaymentModel,
): Promise<boolean> {
	await apiClient.patch<string>({
		url: `/inspection-costs/payments/${details.instanceId}/cancel`,
	});

	return true;
}

export { cancelCostsPayment };
