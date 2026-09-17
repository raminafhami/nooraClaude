import apiClient from "@/api/client";

import { DebtUserType } from "../enums/DebtUserType";
import { Debt } from "../models/Debt";
import { DebtApi } from "../models/DebtApi";
import { parseDebt } from "../utils/parseDebt";

interface CreateDebtsDto {
  instanceId: string;
  users: {
    id: string;
    type: DebtUserType;
  }[];
}

interface CreateDebtsApi {
  instanceId: string;
  users: {
    id: string;
    type: DebtUserType;
  }[];
}

async function createDebts(details: CreateDebtsDto): Promise<Debt[]> {
  const data: CreateDebtsApi = {
    instanceId: details.instanceId,
    users: details.users,
  };

  const response = await apiClient.post<DebtApi[]>({
    url: "create-debt",
    body: data,
  });

  return parseDebt(response.result);
}

export { createDebts };
