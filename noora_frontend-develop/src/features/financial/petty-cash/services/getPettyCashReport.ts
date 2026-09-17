import apiClient from "@/api/client";

import { PettyCashBaseQuery } from "../models/PettyCashQuery";

async function getPettyCashReport(
	options?: Pick<PettyCashBaseQuery, "filters" | "sort">,
): Promise<Blob> {
	const response = await apiClient.send({
		url: "petty-cash",
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

export { getPettyCashReport };
