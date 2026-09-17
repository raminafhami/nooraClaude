import apiClient from "../client";

interface UploadProjectTaskFilesDto {
	attachments: File[];
	taskId: string;
}

async function uploadProjectTaskFiles({
	attachments,
	taskId,
}: UploadProjectTaskFilesDto) {
	let response;
	let link = `project-task/upload/${taskId}`;
	const data = new FormData();

	attachments.forEach((file) => {
		data.append("files", file);
	});

	response = await apiClient.post({
		url: link,
		body: data,
		contentType: "multipart",
	});

	return response;
}

export default uploadProjectTaskFiles;
