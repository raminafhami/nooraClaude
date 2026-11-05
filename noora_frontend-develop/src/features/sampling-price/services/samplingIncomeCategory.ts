import apiClient from "@/api/client";

type SamplingIncomeCategory = {
	_id: string;
	title: string;
	key: string;
};

/** the income category sampling fees are recorded under (key `sampling`) */
async function getSamplingIncomeCategory(): Promise<SamplingIncomeCategory | null> {
	const response = await apiClient.get<SamplingIncomeCategory | null>({
		url: "sampling-price/income-category",
	});

	return response.result ?? null;
}

async function upsertSamplingIncomeCategory(
	title: string,
): Promise<SamplingIncomeCategory> {
	const response = await apiClient.put<SamplingIncomeCategory>({
		url: "sampling-price/income-category",
		body: { title },
	});

	return response.result;
}

export { getSamplingIncomeCategory, upsertSamplingIncomeCategory };
export type { SamplingIncomeCategory };
