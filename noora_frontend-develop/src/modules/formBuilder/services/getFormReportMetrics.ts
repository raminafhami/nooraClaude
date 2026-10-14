import apiClient from "@/api/client";

import { FormReportMetrics } from "../models/FormReportRow";
import { FormReportFilters } from "./getFormReport";

async function getFormReportMetrics(
	filters: Omit<FormReportFilters, "page" | "size">,
): Promise<FormReportMetrics> {
	const searchParams: Record<string, string> = {};
	Object.entries(filters).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			searchParams[key] = String(value);
		}
	});

	const response = await apiClient.get<FormReportMetrics>({
		url: "form-builder/reports/metrics",
		searchParams,
	});

	return response.result;
}

export { getFormReportMetrics };
