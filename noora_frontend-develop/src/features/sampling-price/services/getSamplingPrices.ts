import apiClient from "@/api/client";

import { SamplingPrice } from "../models/SamplingPrice";

async function getSamplingPrices(): Promise<SamplingPrice[]> {
	const response = await apiClient.query<SamplingPrice>({
		url: "sampling-price",
		queryOptions: { filters: { isDeleted: false }, sort: { title: "asc" } },
	});

	return response.result.data;
}

export { getSamplingPrices };
