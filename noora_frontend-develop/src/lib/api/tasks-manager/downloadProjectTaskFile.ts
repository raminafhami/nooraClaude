import apiClient from "../client";

interface DownloadProjectTaskFileDto {
	filePath: string;
}

async function downloadProjectTaskFile({
	filePath,
}: DownloadProjectTaskFileDto): Promise<Blob> {
	const response = await apiClient.send({
		method: "post",
		url: "project-task/get-file",
		body: {
			filePath,
		},
		responseType: "blob",
	});

	return response;
}

export { downloadProjectTaskFile };
