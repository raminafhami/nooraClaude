import apiClient from "@/api/client";

async function deleteContractNumber(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `contract-number/${id}`,
	});

	return true;
}

export { deleteContractNumber };
