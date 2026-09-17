import apiClient from "@/api/client";

type GetDashboardRankingReportReturn = {
	id: string;
	doc_count: number;
	totalFee: number;
	name: string;
}[];

async function getDashboardRankingReport({
	dateFrom,
	dateTo,
}: {
	dateFrom: string;
	dateTo: string;
}): Promise<GetDashboardRankingReportReturn> {
	const response = await apiClient.get<GetDashboardRankingReportReturn>({
		url: "reports/dashboard-ranking",
		searchParams: {
			dateFrom,
			dateTo,
		},
	});

	return response.result;
}

export { getDashboardRankingReport };
