import apiClient from "@/api/client";

interface DeletePropertyProps {
	id: string;
}

export default async function deleteProperty({ id }: DeletePropertyProps) {
	let response;

	response = await apiClient.delete({
		url: `property/${id}`,
	});

	return response;
}
