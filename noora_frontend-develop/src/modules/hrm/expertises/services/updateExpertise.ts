import apiClient from "@/api/client";

import { Expertise } from "../models/Expertise";

type UpdateExpertiseDto = {
	title: string;
};

type UpdateExpertiseApi = {
	title: string;
};

async function updateExpertise(
	id: string,
	input: Partial<UpdateExpertiseDto>,
): Promise<Expertise> {
	const data: Partial<UpdateExpertiseApi> = {};

	if (typeof input.title !== "undefined") data.title = input.title.trim();

	const response = await apiClient.put<Expertise>({
		url: `expertise/${id}`,
		body: data,
	});

	return response.result;
}

export { updateExpertise };
