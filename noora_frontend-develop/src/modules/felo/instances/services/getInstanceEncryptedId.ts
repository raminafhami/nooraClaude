import apiClient from "@/api/client";

async function getInstanceEncryptedId(instanceId: string): Promise<string> {
	const response = await apiClient.post<string>({
		url: "process-instances/encrypt",
		body: {
			instanceId,
		},
	});

	return response.result;
}

export { getInstanceEncryptedId };
