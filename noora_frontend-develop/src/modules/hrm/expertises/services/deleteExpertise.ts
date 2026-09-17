import apiClient from "@/api/client";

async function deleteExpertise(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `expertise/${id}`,
	});

	return true;
}

export { deleteExpertise };
