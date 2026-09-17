import apiClient from "@/api/client";

interface DownloadProjectTaskFileDto {
	id: string;
}

async function downloadPropertyFile({
	id,
}: DownloadProjectTaskFileDto): Promise<Blob> {
	const response = await apiClient.send({
		method: "get",
		url: `property/${id}/show`,

		responseType: "blob",
	});

	return response;
}

export { downloadPropertyFile };
