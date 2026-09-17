import apiClient from "@/api/client";

async function deleteCompanyDocumentFile(fileId: string): Promise<boolean> {
	await apiClient.delete({
		url: `company-files/${fileId}`,
	});

	return true;
}

export { deleteCompanyDocumentFile };
