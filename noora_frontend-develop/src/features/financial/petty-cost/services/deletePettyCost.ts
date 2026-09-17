import apiClient from "@/api/client";

async function deletePettyCost(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `petty-cost/${id}`,
	});
	return true;
}

export { deletePettyCost };
