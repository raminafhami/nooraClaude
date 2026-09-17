import apiClient from "@/api/client";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

interface GetInstancesReportDto {
	page?: number;
	size?: number;
	filters?: string[];
	groupBy?: string;
	aggFunc?: string;
	select?: string;
}

interface GetInstancesReportReturn {
	data: ObjectType[];
	total: number;
}

async function getInstancesReport(
	input: GetInstancesReportDto,
): Promise<GetInstancesReportReturn> {
	const { page = 0, size = 10, ...inputRest } = input;

	const searchParams = new URLSearchParams();
	searchParams.append("page", page.toString());
	searchParams.append("size", size.toString());
	getObjectEntries(inputRest)
		.filter((x) => x[1])
		.forEach(([name, value]) => {
			if (Array.isArray(value)) {
				value.forEach((x) => {
					searchParams.append(name, x);
				});
			} else {
				searchParams.append(name, value!);
			}
		});

	const response = await apiClient.get({
		url: "reports/instances",
		searchParams,
	});

	return response.result;
}

export { getInstancesReport };
