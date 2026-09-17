import apiClient from "@/api/client";

async function deleteUnofficialPettyCosts(costIds: string[]): Promise<void> {
	await apiClient.delete({
		url: `petty-cost/batch/unofficial-costs`,
		body: {
			costIds,
		},
	});
}

export { deleteUnofficialPettyCosts };
