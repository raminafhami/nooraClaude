import apiClient from "@/api/client";

type LifecycleProperty = {
	maintenanceCosts: number;
	repairCosts: number;
	decommissionValue: number;
};

async function getlifecycleProperty(id: string): Promise<LifecycleProperty> {
	const response = await apiClient.get({
		url: `/property/${id}/lifecycle`,
	});

	return response.result;
}

export { getlifecycleProperty };
