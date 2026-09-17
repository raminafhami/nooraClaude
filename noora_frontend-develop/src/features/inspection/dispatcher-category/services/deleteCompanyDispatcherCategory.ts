import apiClient from "@/api/client";

async function deleteCompanyDispatcherCategory(
	domainCode: string,
): Promise<boolean> {
	await apiClient.delete({
		url: "dispatcher-category/company",
		body: { codes: [domainCode] },
	});

	return true;
}

export { deleteCompanyDispatcherCategory };
