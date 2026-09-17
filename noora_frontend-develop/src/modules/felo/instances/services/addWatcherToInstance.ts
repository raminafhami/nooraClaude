import apiClient from "@/api/client";

async function addWatcherToInstance(
	instanceId: string,
	userId: string,
): Promise<boolean> {
	await apiClient.put({
		url: `/process-instances/${instanceId}/watcher/${userId}`,
	});

	return true;
}

export { addWatcherToInstance };
