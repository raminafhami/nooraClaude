import apiClient from "@/api/client";

async function deletePettyCashFile(
	pettyCashId: string,
	filePath: string,
): Promise<void> {
	await apiClient.delete({
		url: `petty-cash/delete-file/${pettyCashId}`,
		body: {
			filePath,
		},
	});
}

export { deletePettyCashFile };
