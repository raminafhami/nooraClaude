import apiClient from "@/api/client";
import { InstanceBaseQuery } from "@/felo/instances/models/InstanceQuery";
import { parseInstanceFilters } from "@/felo/instances/utils/parseInstanceFilters";

async function getInvoicePaymentInstanceReport(
	options: Pick<InstanceBaseQuery, "filters"> = { filters: [] },
): Promise<Blob> {
	const searchParams = new URLSearchParams();

	searchParams.set("page", "0");
	searchParams.set("size", "10");

	parseInstanceFilters(searchParams, options);

	const response = await apiClient.send({
		url: "process-instances/invoice-payment-report",
		searchParams,
		responseType: "blob",
	});

	return response;
}

export { getInvoicePaymentInstanceReport };
