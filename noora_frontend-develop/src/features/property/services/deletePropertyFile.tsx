import apiClient from "@/api/client";

interface DeletePropertyFileProps {
	id: string;
}

export default async function deletePropertyFile({
	id,
}: DeletePropertyFileProps) {
	let response;

	response = await apiClient.delete({
		url: `property/file/${id}`,
	});

	return response;
}
