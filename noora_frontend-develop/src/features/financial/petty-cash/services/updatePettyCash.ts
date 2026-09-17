import apiClient from "@/api/client";

import { PettyCashApi } from "../models/PettyCash";

type UpdatePettyCashDto = Partial<{
	title: string;
	amount: number;
	description: string;
	bankShebaNumber: string;
	bankCardNumber: string;
	categoryIds: string[];
}>;

type UpdatePettyCashApi = UpdatePettyCashDto;

async function updatePettyCash(
	id: string,
	details: UpdatePettyCashDto,
): Promise<PettyCashApi> {
	const data: UpdatePettyCashApi = {
		title: details.title,
		amount: details.amount,
		description: details.description,
		bankShebaNumber: details.bankShebaNumber,
		bankCardNumber: details.bankCardNumber,
		categoryIds: details.categoryIds,
	};

	const response = await apiClient.put<PettyCashApi>({
		url: `petty-cash/${id}`,
		body: data,
	});

	return response.result;
}

export { updatePettyCash };
