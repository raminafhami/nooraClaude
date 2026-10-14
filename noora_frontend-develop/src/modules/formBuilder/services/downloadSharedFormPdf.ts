import apiClient from "@/api/client";

async function downloadSharedFormPdf(shareId: string): Promise<Blob> {
	return apiClient.send({
		method: "get",
		url: `form-builder/shares/${shareId}/pdf`,
		responseType: "blob",
	});
}

export { downloadSharedFormPdf };
