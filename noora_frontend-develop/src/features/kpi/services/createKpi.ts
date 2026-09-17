import apiClient from "@/api/client";

import { KpiApi } from "../models/Kpi";

type CreateKpiDto = {
	title: string;
	targetType: string;
	userId?: string;
	groupId?: string;
	position: string;
	processKeys: string[];
	timeFrame: string;
	startDate: string;
	endDate: string;
	targets: {
		metric: string;
		value: number;
	}[];
};

async function createKpi(details: CreateKpiDto): Promise<KpiApi> {
	const data: CreateKpiDto = details;

	const response = await apiClient.post<KpiApi>({
		url: "kpi",
		body: data,
	});

	return response.result;
}

export { createKpi };
