import apiClient from "@/api/client";

interface UploadPropertyFileProps {
	id: string;
	title: string;
	file: File;
}

async function uploadProjectTaskFiles({
	id,
	title,
	file,
}: UploadPropertyFileProps) {
	let response;
	let link = `property/${id}/file`;

	const data = new FormData();

	data.append("title", title);
	data.append("file", file);

	response = await apiClient.post({
		url: link,
		body: data,
		contentType: "multipart",
	});

	return response;
}

export default uploadProjectTaskFiles;
