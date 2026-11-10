import apiClient from "@/api/client";

import { Contract } from "../models/Contract";
import { ContractApi } from "../models/ContractApi";
import { parseContract } from "../utils/parseContract";

/** the signed-in person's own contract (needs only contract read_own) */
export async function getOwnContractById(id: string): Promise<Contract> {
  const response = await apiClient.get<ContractApi>({
    url: `/contract/${id}/own`,
  });

  return parseContract(response.result);
}
