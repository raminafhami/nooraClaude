import apiClient from "@/api/client";

import { FormAnswerFile } from "../models/FormAnswerFile";

async function uploadOccurrenceAnswerFile(
	occurrenceId: string,
	questionId: string,
	file: File,
): Promise<FormAnswerFile> {
	const response = await apiClient.post<FormAnswerFile>({
		url: `form-builder/occurrences/${occurrenceId}/files`,
		body: { questionId, file },
		contentType: "multipart",
	});

	return response.result;
}

async function deleteOccurrenceAnswerFile(
	occurrenceId: string,
	fileId: string,
): Promise<void> {
	await apiClient.delete({
		url: `form-builder/occurrences/${occurrenceId}/files/${fileId}`,
	});
}

// One downloader per viewer, each hitting the endpoint that authorizes that
// viewer: the completer, a QA manager, or a share recipient.
function ownerAnswerFileDownloader(occurrenceId: string) {
	return (fileId: string): Promise<Blob> =>
		apiClient.send({
			method: "get",
			url: `form-builder/occurrences/${occurrenceId}/files/${fileId}`,
			responseType: "blob",
		});
}

function adminAnswerFileDownloader(occurrenceId: string) {
	return (fileId: string): Promise<Blob> =>
		apiClient.send({
			method: "get",
			url: `form-builder/reports/occurrences/${occurrenceId}/files/${fileId}`,
			responseType: "blob",
		});
}

function sharedAnswerFileDownloader(shareId: string) {
	return (fileId: string): Promise<Blob> =>
		apiClient.send({
			method: "get",
			url: `form-builder/shares/${shareId}/files/${fileId}`,
			responseType: "blob",
		});
}

export {
	adminAnswerFileDownloader,
	deleteOccurrenceAnswerFile,
	ownerAnswerFileDownloader,
	sharedAnswerFileDownloader,
	uploadOccurrenceAnswerFile,
};
