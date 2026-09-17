import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Contract } from "../models/Contract";
import { ContractApi } from "../models/ContractApi";
import {
	ContractBaseQuery,
	ContractPageQuery,
	ContractQuery,
} from "../models/ContractQuery";
import { parseContract } from "../utils/parseContract";

async function getContracts(options?: ContractBaseQuery): Promise<Contract[]>;

async function getContracts(
	options: ContractPageQuery,
): Promise<EntityPageResult<Contract>>;

async function getContracts(
	options: ContractQuery = {},
): Promise<Contract[] | EntityPageResult<Contract>> {
	const response = await apiClient.query<ContractApi>({
		url: "contract",
		queryOptions: options,
		$and: false,
	});

	if (!options.pagination) {
		return parseContract((response.result as any).contracts as ContractApi[]);
	}

	return {
		items: parseContract((response.result as any).contracts as ContractApi[]),
		page: options.pagination.page,
		pageSize: options.pagination.pageSize,
		total: response.result.count,
	};
}

export { getContracts };
