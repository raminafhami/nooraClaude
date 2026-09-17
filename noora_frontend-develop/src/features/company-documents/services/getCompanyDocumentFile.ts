import apiClient from "@/api/client";

async function getCompanyDocumentFile(fileId: string): Promise<Blob> {
	const response = await apiClient.send({
		method: "get",
		url: `company-files/${fileId}/file`,
		responseType: "blob",
	});

	return response;
}

export { getCompanyDocumentFile };
