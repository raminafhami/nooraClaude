import apiClient from "@/api/client";

async function updateCostsTotalsByCase(instanceId: string): Promise<void> {
  await apiClient.patch({
    url: `/inspection-costs/case/update-costs/${instanceId}`,
  });
}

export { updateCostsTotalsByCase };
