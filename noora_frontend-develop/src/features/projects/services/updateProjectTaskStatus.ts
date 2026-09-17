import apiClient from "@/api/client";

async function updateProjectTaskStatus(
	id: string,
	statusId: string,
): Promise<boolean> {
	await apiClient.patch({
		url: `project-task/${id}/${statusId}`,
	});

	return true;
}

export { updateProjectTaskStatus };
