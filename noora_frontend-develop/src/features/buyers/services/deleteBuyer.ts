import apiClient from "@/api/client";

async function deleteBuyer(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `buyers/${id}`,
	});

	return true;
}

export { deleteBuyer };
