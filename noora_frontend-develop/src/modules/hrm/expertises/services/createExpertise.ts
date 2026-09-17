import apiClient from "@/api/client";

import { ExpertiseType } from "../enums/ExpertiseType";
import { Expertise } from "../models/Expertise";

type CreateExpertiseDto = {
	title: string;
	type: ExpertiseType;
};

type CreateExpertiseApi = {
	title: string;
	type: ExpertiseType;
};

async function createExpertise(input: CreateExpertiseDto): Promise<Expertise> {
	const data: CreateExpertiseApi = {
		title: input.title.trim(),
		type: input.type,
	};

	const response = await apiClient.post<Expertise>({
		url: "expertise",
		body: data,
	});

	return response.result;
}

export { createExpertise };
