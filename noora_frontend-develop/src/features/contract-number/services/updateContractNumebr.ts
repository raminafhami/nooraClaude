import apiClient from "@/api/client";

import { ContractNumber } from "../models/ContractNumber";

type UpdateContractNumberDto = Partial<{
	title: string;
	buyerId: string;
	customerId?: string | null;
	proforma?: string | null;
	isDeleted: boolean;
}>;

type UpdateContractNumberApi = UpdateContractNumberDto;

async function updateContractNumber(
	id: string,
	details: UpdateContractNumberDto,
): Promise<ContractNumber> {
	const data: UpdateContractNumberApi = {
		...details,
		title: details.title?.trim() ?? undefined,
	};

	const response = await apiClient.patch<ContractNumber>({
		url: `contract-number/${id}`,
		body: data,
	});

	return response.result;
}

export { updateContractNumber };
