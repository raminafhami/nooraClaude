import apiClient from "@/api/client";

interface UpdateCompanyDocumentDto {
	title: string;
	description: string;
	date: string;
}

async function updateCompanyDocument(
	id: string,
	details: UpdateCompanyDocumentDto,
) {
	const response = await apiClient.put({
		url: `company-files/${id}`,
		body: details,
	});

	return response;
}

export { updateCompanyDocument };
