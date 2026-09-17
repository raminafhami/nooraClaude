import apiClient from "@/api/client";
import { ApiPageResult } from "@/api/models/ApiResponse";

type GetProcessesSlaReportDto = {
	dateFrom: string;
	dateTo: string;
	page: number;
	size: number;
};

async function getProcessesSlaReport({
	dateFrom,
	dateTo,
	page,
	size,
}: GetProcessesSlaReportDto): Promise<ApiPageResult> {
	const response = await apiClient.get<ApiPageResult>({
		url: "/reports/process-completion",
		searchParams: {
			dateFrom,
			dateTo,
			page,
			size,
		},
	});

	return response.result;
}

export { getProcessesSlaReport };
