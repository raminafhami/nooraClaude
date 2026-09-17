import apiClient from "@/api/client";

async function deletePettyCash(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `petty-cash/${id}`,
	});
	return true;
}

export { deletePettyCash };
