import apiClient from "@/api/client";

import { Property } from "../models/Property";

async function assignPropertyToUser(
	id: string,
	userId: string,
): Promise<Property> {
	const data = { userId: userId };

	const response = await apiClient.post<Property>({
		url: `property/${id}/assign`,
		body: data,
	});

	return response.result;
}

export { assignPropertyToUser };
