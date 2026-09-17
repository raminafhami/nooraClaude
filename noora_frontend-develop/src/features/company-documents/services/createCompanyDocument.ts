import apiClient from "@/api/client";

interface CreateCompanyDocumentDto {
	title: string;
	description: string;
	date: string;
	file: File;
}

async function createCompanyDocument({
	title,
	description,
	date,
	file,
}: CreateCompanyDocumentDto) {
	const response = await apiClient.post({
		url: "company-files",
		body: {
			title,
			description,
			date,
			file,
		},
		contentType: "multipart",
	});

	return response;
}

export { createCompanyDocument };
