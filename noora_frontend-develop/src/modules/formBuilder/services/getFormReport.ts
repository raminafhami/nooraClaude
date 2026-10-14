import apiClient from "@/api/client";

import { FormOccurrenceStatus } from "../enums/FormOccurrenceStatus";
import { FormReportRow } from "../models/FormReportRow";

type FormReportFilters = {
	page: number;
	size: number;
	title?: string;
	code?: string;
	categoryId?: string;
	formId?: string;
	userId?: string;
	status?: FormOccurrenceStatus;
	periodKey?: string;
	dueDateFrom?: string;
	dueDateTo?: string;
	overdue?: string;
};

async function getFormReport(
	filters: FormReportFilters,
): Promise<{ data: FormReportRow[]; count: number }> {
	const searchParams: Record<string, string> = {};
	Object.entries(filters).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			searchParams[key] = String(value);
		}
	});

	const response = await apiClient.get<{ data: FormReportRow[]; count: number }>({
		url: "form-builder/reports/occurrences",
		searchParams,
	});

	return response.result;
}

export { getFormReport };
export type { FormReportFilters };
