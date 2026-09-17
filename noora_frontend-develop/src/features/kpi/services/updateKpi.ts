import apiClient from "@/api/client";

import { KpiApi } from "../models/Kpi";

type UpdateKpiDto = {
	title: string;
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

type UpdateKpiApi = UpdateKpiDto;

async function updateKpi(id: string, details: UpdateKpiDto): Promise<KpiApi> {
	const data: UpdateKpiApi = details;

	const response = await apiClient.put<KpiApi>({
		url: `kpi/${id}`,
		body: data,
	});

	return response.result;
}

export { updateKpi };
