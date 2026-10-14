import apiClient from "@/api/client";

async function downloadRawFormPdf(formId: string): Promise<Blob> {
	return apiClient.send({
		method: "get",
		url: `form-builder/forms/${formId}/pdf/raw`,
		responseType: "blob",
	});
}

async function downloadOccurrenceRawFormPdf(occurrenceId: string): Promise<Blob> {
	return apiClient.send({
		method: "get",
		url: `form-builder/occurrences/${occurrenceId}/pdf/raw`,
		responseType: "blob",
	});
}

async function downloadOccurrenceCompletedFormPdf(
	occurrenceId: string,
): Promise<Blob> {
	return apiClient.send({
		method: "get",
		url: `form-builder/occurrences/${occurrenceId}/pdf/completed`,
		responseType: "blob",
	});
}

async function downloadOccurrencePdfAsAdmin(occurrenceId: string): Promise<Blob> {
	return apiClient.send({
		method: "get",
		url: `form-builder/reports/occurrences/${occurrenceId}/pdf`,
		responseType: "blob",
	});
}

export {
	downloadRawFormPdf,
	downloadOccurrenceRawFormPdf,
	downloadOccurrenceCompletedFormPdf,
	downloadOccurrencePdfAsAdmin,
};
