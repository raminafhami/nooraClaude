import apiClient from "@/api/client";

async function cancelDebts(instanceId: string): Promise<boolean> {
  await apiClient.patch({
    url: `amount/${instanceId}/0`,
  });

  await apiClient.patch({
    url: "pay-instance-debt",
    body: {
      instanceIds: [instanceId],
    },
  });

  return true;
}

export { cancelDebts };
