import apiClient from "@/api/client";
import { getObjectEntries } from "@/utils/object/getObjectEntries";

async function sendEmailRequest({ data }: { data: any }) {
	const { files, ...dataRest } = data;

	const formData = new FormData();
	getObjectEntries(dataRest).forEach(([key, value]) => {
		formData.append(key.toString(), value);
	});

	files.forEach((file: File) => {
		formData.append("files", file);
	});

	const response = await apiClient.post({
		url: "emails/send",
		body: formData,
		contentType: "multipart",
	});

	return response.result;
}

export { sendEmailRequest };
