import apiClient from "@/api/client";

import { DispatcherCategory } from "../models/DispatcherCategory";

type GetDispatcherCategoryByCodeReturn = {
	categories: Pick<
		DispatcherCategory,
		"type" | "domainCode" | "inspectionDomain"
	>[];
	existInYourDomainCode: boolean;
};

async function getDispatcherCategoryByCode(
	code: string,
): Promise<GetDispatcherCategoryByCodeReturn> {
	const response = await apiClient.get<GetDispatcherCategoryByCodeReturn>({
		url: `dispatcher-category/code/${code}`,
	});

	return response.result;
}

export type { GetDispatcherCategoryByCodeReturn };
export { getDispatcherCategoryByCode };
