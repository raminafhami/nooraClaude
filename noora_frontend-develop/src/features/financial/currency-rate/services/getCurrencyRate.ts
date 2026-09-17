import apiClient from "@/api/client";

type GetCurrencyRateResponse = {
	title: string;
	price: string;
	min: string;
	max: string;
	updatedAt: string;
};

async function getCurrencyRate(code: string): Promise<string> {
	const response = await apiClient.get<GetCurrencyRateResponse>({
		url: `currency-rate/${code}`,
		searchParams: {
			type: "getTransferRates",
		},
	});

	return response.result.price;
}

export { getCurrencyRate };
