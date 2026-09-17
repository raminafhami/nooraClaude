import apiClient from "@/api/client";

async function getCompanyDispatcherCategoryDomainCodes(): Promise<string[]> {
	const response = await apiClient.get<string[]>({
		url: "dispatcher-category/company",
	});

	return response.result;
}

export { getCompanyDispatcherCategoryDomainCodes };
