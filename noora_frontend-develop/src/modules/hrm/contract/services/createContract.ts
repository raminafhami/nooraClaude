import apiClient from "@/api/client";

import { ContractStatus } from "../enums/ContractStatus";
import { Contract } from "../models/Contract";
import { ContractApi } from "../models/ContractApi";
import { parseContract } from "../utils/parseContract";

interface ContractCreateModel {
  userId: string;
  contractNo: string;
  signDate: string;
  jobs: string[];
  startDate: string;
  endDate: string;
  period: number;
  salaryType: string;
  salaryAmount: number;
  status: ContractStatus;
  workplace: string;
  bankAccountNumber: string;
  bankName: string;
  bankBranch: string;
  damages: string;
}

export async function createContract(
  details: ContractCreateModel,
): Promise<Contract> {
  const data = { ...details, approvers: [] };

  const response = await apiClient.post<ContractApi>({
    url: `/contract`,
    body: data,
  });

  return parseContract(response.result);
}
