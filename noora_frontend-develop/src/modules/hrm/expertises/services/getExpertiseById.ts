import apiClient from "@/api/client";

import { Expertise } from "../models/Expertise";

async function getExpertiseById(id: string): Promise<Expertise> {
	const response = await apiClient.get<Expertise>({
		url: `expertise/${id}`,
	});

	return response.result;
}

export { getExpertiseById };
