import apiClient from "@/api/client";

import { PettyCostBaseQuery } from "../models/PettyCostQuery";

async function getPettyCostReport(
	options?: Pick<PettyCostBaseQuery, "filters" | "sort">,
): Promise<Blob> {
	const response = await apiClient.send({
		url: "petty-cost",
		responseType: "blob",
		searchParams: {
			filters: JSON.stringify(options?.filters) || undefined,
			sort: JSON.stringify(options?.sort) || undefined,
			page: 0,
			size: 10,
			download: "xlsx",
		},
	});

	return response;
}

export { getPettyCostReport };
