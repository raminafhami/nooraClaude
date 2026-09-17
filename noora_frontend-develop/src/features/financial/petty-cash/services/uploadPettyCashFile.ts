import apiClient from "@/api/client";

interface UploadPettyCashFileDto {
	attachments: File[];
	pettyCashId: string;
}

async function uploadPettyCashFile({
	attachments,
	pettyCashId,
}: UploadPettyCashFileDto) {
	let response;
	let link = `petty-cash/upload/${pettyCashId}`;
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

export default uploadPettyCashFile;
