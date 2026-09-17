import apiClient from "../client";
import { CreateOwnDebtsResult } from "./models/debtsModels";

interface OwnDebtsProps {
  instanceId: string;
  amount: string;
}

export default async function updateDebts({
  instanceId,
  amount,
}: OwnDebtsProps): Promise<CreateOwnDebtsResult | undefined> {
  let response;
  let link = `amount/${instanceId}/${amount}`;

  try {
    response = await apiClient.patch({
      url: link,
    });

    return response as CreateOwnDebtsResult;
  } catch (error) {
    console.error("Error update debts:", error);
    return undefined;
  }
}
