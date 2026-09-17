import apiClient from "@/api/client";
import { getObjectEntries } from "@/utils/object/getObjectEntries";

type ForwardEmailRequestDto = {
	data: any;
};

async function forwardEmailRequest({ data }: ForwardEmailRequestDto) {
	const { files, ...dataRest } = data;

	const formData = new FormData();
	getObjectEntries(dataRest).forEach(([key, value]) => {
		formData.append(key.toString(), value);
	});

	files.forEach((file: File) => {
		formData.append("files", file);
	});

	const response = await apiClient.post({
		url: "emails/forward",
		body: formData,
		contentType: "multipart",
	});

	return response.result;
}

export { forwardEmailRequest };
