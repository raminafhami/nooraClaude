import apiClient from "@/api/client";

async function deleteCost(id: string): Promise<void> {
	await apiClient.delete({
		url: `/inspection-costs/${id}`,
	});
}

export { deleteCost };
