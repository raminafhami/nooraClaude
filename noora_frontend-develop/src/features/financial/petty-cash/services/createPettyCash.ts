import apiClient from "@/api/client";

import { PettyCashApi } from "../models/PettyCash";

type CreatePettyCashDto = {
	title: string;
	userId: string;
	categoryIds: string[];
	amount: number;
	description: string;
	bankCardNumber?: string;
	bankShebaNumber?: string;
};

type CreatePettyCashApi = CreatePettyCashDto;

async function createPettyCash(
	details: CreatePettyCashDto,
): Promise<PettyCashApi> {
	const data: CreatePettyCashApi = {
		title: details.title,
		userId: details.userId,
		categoryIds: details.categoryIds,
		amount: details.amount,
		description: details.description.trim(),
		bankCardNumber: details.bankCardNumber || undefined,
		bankShebaNumber: details.bankShebaNumber || undefined,
	};

	const response = await apiClient.post<PettyCashApi>({
		url: "petty-cash",
		body: data,
	});

	return response.result;
}

export { createPettyCash };
