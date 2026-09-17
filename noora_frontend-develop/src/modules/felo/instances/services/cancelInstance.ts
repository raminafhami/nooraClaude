import apiClient from "@/api/client";

type CancelInstanceDto = {
	reason: string;
	description?: string;
};

type CancelInstanceApi = {
	reason: string;
	description?: string;
};

async function cancelInstance(
	id: string,
	details: CancelInstanceDto,
): Promise<boolean> {
	const data: CancelInstanceApi = {
		reason: details.reason,
		description: details.description,
	};

	await apiClient.put({
		url: `process-instances/${id}/cancel`,
		body: data,
	});

	return true;
}

export { cancelInstance };
