import apiClient from "@/api/client";

interface InstanceDataUpdateApiModel {
	parameters: any;
}

export async function updateInstanceData(
	id: string,
	details: any,
): Promise<boolean> {
	if (!details || typeof details !== "object") {
		throw new Error("Bad request");
	}

	const data: InstanceDataUpdateApiModel = {
		parameters: details,
	};

	await apiClient.put({
		url: `/process-instances/${id}`,
		body: data,
	});

	return true;
}
