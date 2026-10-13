import apiClient from "@/api/client";

interface CreateCompanyDocumentDto {
	title: string;
	description: string;
	date: string;
	expiryDate?: string | null;
	file: File;
}

async function createCompanyDocument({
	title,
	description,
	date,
	expiryDate,
	file,
}: CreateCompanyDocumentDto) {
	const response = await apiClient.post({
		url: "company-files",
		body: {
			title,
			description,
			date,
			expiryDate,
			file,
		},
		contentType: "multipart",
	});

	return response;
}

export { createCompanyDocument };
