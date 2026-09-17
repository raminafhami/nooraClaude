import apiClient from "@/api/client";

import { CostApi } from "../models/CostApi";
import { CostPaymentVoucher } from "../models/CostPayment";

type UpdateCostsPaymentVouchersDto = {
	id: string;
	vouchers: CostPaymentVoucher[];
}[];

type UpdateCostsPaymentVouchersApi = { data: UpdateCostsPaymentVouchersDto };

async function updateCostsPaymentVouchers(
	details: UpdateCostsPaymentVouchersDto,
): Promise<boolean> {
	const data: UpdateCostsPaymentVouchersApi = { data: [...details] };

	await apiClient.post<CostApi[]>({
		url: "/inspection-costs/payments/vouchers",
		body: data,
	});

	return true;
}

export { updateCostsPaymentVouchers };
