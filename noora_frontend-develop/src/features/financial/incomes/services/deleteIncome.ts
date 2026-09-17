import apiClient from "@/api/client";

async function deleteIncome(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `income/${id}`,
	});

	return true;
}

export { deleteIncome };
