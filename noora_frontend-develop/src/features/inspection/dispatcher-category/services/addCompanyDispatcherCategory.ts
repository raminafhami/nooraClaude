import apiClient from "@/api/client";

async function addCompanyDispatcherCategory(
	domainCode: string,
): Promise<boolean> {
	await apiClient.post({
		url: "dispatcher-category/company",
		body: { codes: [domainCode] },
	});

	return true;
}

export { addCompanyDispatcherCategory };
