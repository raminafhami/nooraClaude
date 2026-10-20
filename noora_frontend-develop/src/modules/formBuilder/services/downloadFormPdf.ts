import apiClient from "@/api/client";

async function downloadRawFormPdf(
	formId: string,
	options: { draft?: boolean } = {},
): Promise<Blob> {
	return apiClient.send({
		method: "get",
		url: `form-builder/forms/${formId}/pdf/raw`,
		searchParams: options.draft ? { draft: "true" } : undefined,
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

async function downloadAssignmentRawFormPdf(
	assignmentId: string,
): Promise<Blob> {
	return apiClient.send({
		method: "get",
		url: `form-builder/assignments/${assignmentId}/pdf/raw`,
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
	downloadAssignmentRawFormPdf,
	downloadRawFormPdf,
	downloadOccurrenceRawFormPdf,
	downloadOccurrenceCompletedFormPdf,
	downloadOccurrencePdfAsAdmin,
};
