import apiClient from "@/api/client";

import { Property } from "../models/Property";

async function unassignProperty(id: string): Promise<Property> {
	const response = await apiClient.post<Property>({
		url: `property/${id}/unassign`,
	});

	return response.result;
}

export { unassignProperty };
