import apiClient from "@/api/client";
import { Project } from "@/projects/models/Project";

async function getActivityProject(): Promise<Project | null> {
	const response = await apiClient.get<Project | null>({
		url: "project/type/activity",
	});

	return response.result;
}

export { getActivityProject };
