import apiClient from "@/api/client";

async function deletePettyCostFile(
	costId: string,
	filePath: string,
): Promise<void> {
	await apiClient.delete({
		url: `petty-cost/delete-file/${costId}`,
		body: {
			filePath,
		},
	});
}

export { deletePettyCostFile };
