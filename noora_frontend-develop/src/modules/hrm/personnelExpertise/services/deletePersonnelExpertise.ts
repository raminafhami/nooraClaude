import apiClient from "@/api/client";

async function deletePersonnelExpertise(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `personnel-expertise/${id}`,
	});

	return true;
}

export { deletePersonnelExpertise };
