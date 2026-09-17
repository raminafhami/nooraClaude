import apiClient from "../client";

interface PayDebtsProps {
  instanceId: string[];
}

export default async function payUserDebtByInstanceId({
  instanceId,
}: PayDebtsProps) {
  let response;
  let link = `pay-instance-debt`;

  try {
    response = await apiClient.patch({
      url: link,
      body: {
        instanceIds: instanceId,
      },
    });

    return response;
  } catch (error) {
    console.error("Error fetching own debts:", error);
    return undefined;
  }
}
