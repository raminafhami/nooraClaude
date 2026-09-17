import apiClient from "@/api/client";

import { ContractNumber } from "../models/ContractNumber";

type CreateContractNumberDto = {
	title: string;
	buyerId: string;
	customerId?: string | null;
	proforma?: string | null;
};

type CreateContractNumberApi = Pick<
	CreateContractNumberDto,
	"title" | "buyerId"
> & {
	customerId?: string;
	proforma?: string;
};

async function createContractNumber(
	details: CreateContractNumberDto,
): Promise<ContractNumber> {
	const data: CreateContractNumberApi = {
		...details,
		title: details.title.trim(),
		customerId: details.customerId ?? undefined,
		proforma: details.proforma?.trim() || undefined,
	};

	const response = await apiClient.post<ContractNumber>({
		url: "contract-number",
		body: data,
	});

	return response.result;
}

export { createContractNumber };
