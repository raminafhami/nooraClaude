import apiClient from "@/api/client";

async function setStageOfInstance(
	instanceId: string,
	name: string,
): Promise<boolean> {
	await apiClient.put({
		url: `/process-instances/${instanceId}/state/${name}`,
	});

	return true;
}

export { setStageOfInstance };
