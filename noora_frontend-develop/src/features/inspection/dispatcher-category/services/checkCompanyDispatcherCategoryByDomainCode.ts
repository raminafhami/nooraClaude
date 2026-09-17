import apiClient from "@/api/client";

async function checkCompanyDispatcherCategoryByDomainCode(
	domainCode: string,
): Promise<boolean> {
	const response = await apiClient.get<{ isExist: boolean }>({
		url: `dispatcher-category/company/${domainCode}`,
	});

	return response.result.isExist;
}

export { checkCompanyDispatcherCategoryByDomainCode };
