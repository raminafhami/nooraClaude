import apiClient from "@/api/client";

async function deleteCostsByCase(instanceId: string): Promise<void> {
	await apiClient.delete({
		url: `/inspection-costs/case/${instanceId}`,
	});
}

export { deleteCostsByCase };
