import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { ContractNumber } from "../models/ContractNumber";
import {
	ContractNumberBaseQuery,
	ContractNumberPageQuery,
	ContractNumberQuery,
} from "../models/ContractNumberQuery";

async function getContractNumbers(
	options?: ContractNumberBaseQuery,
): Promise<ContractNumber[]>;

async function getContractNumbers(
	options: ContractNumberPageQuery,
): Promise<EntityPageResult<ContractNumber>>;

async function getContractNumbers(
	options: ContractNumberQuery = {},
): Promise<ContractNumber[] | EntityPageResult<ContractNumber>> {
	const response = await apiClient.query<ContractNumber>({
		url: "contract-number",
		queryOptions: options,
		$and: false,
	});

	if (!options.pagination) {
		return response.result.data;
	}

	return {
		items: response.result.data,
		page: options.pagination.page,
		pageSize: options.pagination.pageSize,
		total: response.result.count,
	};
}

export { getContractNumbers };
