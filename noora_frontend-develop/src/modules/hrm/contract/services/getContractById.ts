import apiClient from "@/api/client";

import { Contract } from "../models/Contract";
import { ContractApi } from "../models/ContractApi";
import { parseContract } from "../utils/parseContract";

export async function getContractById(id: string): Promise<Contract> {
  const response = await apiClient.get<ContractApi>({
    url: `/contract/${id}`,
  });

  return parseContract(response.result);
}
