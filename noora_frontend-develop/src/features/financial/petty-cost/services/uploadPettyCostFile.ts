import apiClient from "@/api/client";

interface UploadPettyCostFileDto {
	attachments: File[];
	costId: string;
}

async function uploadPettyCostFile({
	attachments,
	costId,
}: UploadPettyCostFileDto) {
	let response;
	let link = `petty-cost/upload/${costId}`;
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

export default uploadPettyCostFile;
