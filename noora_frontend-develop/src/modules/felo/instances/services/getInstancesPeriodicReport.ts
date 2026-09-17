import apiClient from "@/api/client";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

interface GetInstancesPeriodicReportDto {
	period: "day" | "week" | "month" | "year";
	filters?: string[];
	groupBy: string;
	aggFunc?: string[];
	select?: string;
}

async function getInstancesPeriodicReport(
	input: GetInstancesPeriodicReportDto,
): Promise<ObjectType[]> {
	const searchParams = new URLSearchParams();
	searchParams.append("size", "100");
	getObjectEntries(input)
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

	const response = await apiClient.get<ObjectType[]>({
		url: "reports/build-periodic-report",
		searchParams,
	});

	return response.result;
}

export { getInstancesPeriodicReport };
