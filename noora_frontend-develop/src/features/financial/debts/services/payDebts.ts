import apiClient from "@/api/client";

interface PayDebtsApi {
  instanceIds: string[];
}

async function payDebts(instanceIds: string[]): Promise<boolean> {
  const data: PayDebtsApi = {
    instanceIds,
  };

  await apiClient.patch({
    url: "pay-instance-debt",
    body: data,
  });

  return true;
}

export { payDebts };
