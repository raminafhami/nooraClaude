import apiClient from "../client";
import { CreateOwnDebtsResult } from "./models/debtsModels";

interface OwnDebtsProps {
  instanceId: string;
  users: { id: string; type: string }[];
  amount: number;
  caseNo: string;
}

export default async function createDebts({
  instanceId,
  users,
  amount,
  caseNo,
}: OwnDebtsProps): Promise<CreateOwnDebtsResult | undefined> {
  let response;
  let link = `create-debt`;

  try {
    response = await apiClient.post({
      url: link,
      body: {
        instanceId,
        users,
        amount,
        caseNo,
      },
    });

    return response as CreateOwnDebtsResult;
  } catch (error) {
    console.error("Error creating own debts:", error);
    return undefined;
  }
}
