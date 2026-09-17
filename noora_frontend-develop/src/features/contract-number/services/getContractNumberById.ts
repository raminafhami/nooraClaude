import apiClient from "@/api/client";

import { ContractNumber } from "../models/ContractNumber";

async function getContractNumberById(id: string): Promise<ContractNumber> {
	const response = await apiClient.get<ContractNumber>({
		url: `contract-number/${id}`,
	});

	return response.result;
}

export { getContractNumberById };
