import apiClient from "@/api/client";

import { MyFormAssignment } from "../models/MyFormAssignment";

async function getMyFormAssignments(): Promise<MyFormAssignment[]> {
	const response = await apiClient.get<MyFormAssignment[]>({
		url: "form-builder/me/assignments",
	});

	return response.result;
}

export { getMyFormAssignments };
