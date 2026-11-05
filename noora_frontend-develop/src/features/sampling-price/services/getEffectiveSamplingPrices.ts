import apiClient from "@/api/client";

import { EffectiveSamplingPrice } from "../models/SamplingPrice";

/** services offered in `processKey` on `date`, each with its price on that date */
async function getEffectiveSamplingPrices(
	processKey: string,
	date: Date,
): Promise<EffectiveSamplingPrice[]> {
	const response = await apiClient.get<EffectiveSamplingPrice[]>({
		url: "sampling-price/effective",
		searchParams: { processKey, date: date.toISOString() },
	});

	return response.result;
}

export { getEffectiveSamplingPrices };
