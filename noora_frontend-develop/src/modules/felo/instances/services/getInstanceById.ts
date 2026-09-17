import apiClient from "@/api/client";

import { Instance } from "../models/Instance";
import { InstanceApi } from "../models/InstanceApi";
import { parseInstance } from "../utils/parseInstance";

async function getInstanceById(
	id: string,
	paramateres?: string[],
): Promise<Instance> {
	const response = await apiClient.get<InstanceApi>({
		url: `process-instances/${id}`,
		searchParams: {
			props: paramateres?.join(",") ?? "ownerGroup",
		},
	});

	return parseInstance(response.result);
}

export { getInstanceById };
