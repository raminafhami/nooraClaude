import apiClient from "@/api/client";

async function deleteKpi(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `kpi/${id}`,
	});
	return true;
}

export { deleteKpi };
