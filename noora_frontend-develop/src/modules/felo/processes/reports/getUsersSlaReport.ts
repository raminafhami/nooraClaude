import apiClient from "@/api/client";
import { ApiPageResult } from "@/api/models/ApiResponse";

type GetUsersSlaReportDto = {
	dateFrom: string;
	dateTo: string;
	page: number;
	size: number;
};

async function getUsersSlaReport({
	dateFrom,
	dateTo,
	page,
	size,
}: GetUsersSlaReportDto): Promise<ApiPageResult> {
	const response = await apiClient.get<ApiPageResult>({
		url: "/reports/user-task-completion",
		searchParams: {
			dateFrom,
			dateTo,
			page,
			size,
		},
	});

	return response.result;
}

export { getUsersSlaReport };
