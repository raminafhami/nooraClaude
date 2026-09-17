import apiClient from "@/api/client";

import { Cost } from "../models/Cost";
import { CostApi } from "../models/CostApi";
import { parseCost } from "../utils/parseCost";

async function getCostById(id: string): Promise<Cost> {
	const response = await apiClient.get<CostApi>({
		url: `/inspection-costs/${id}`,
	});

	return parseCost(response.result);
}

export { getCostById };
