import apiClient from "@/api/client";

import { ContractStatus } from "../enums/ContractStatus";
import { Contract } from "../models/Contract";
import { ContractApi } from "../models/ContractApi";
import { ContractApprover } from "../models/ContractApprover";
import { parseContract } from "../utils/parseContract";
import { getContractById } from "./getContractById";

export interface ContractDetails {
  contractNo?: string;
  signDate?: string;
  jobs?: string[];
  startDate?: string;
  endDate?: string;
  period?: number;
  salaryType?: string;
  salaryAmount?: number;
  status?: ContractStatus;
  workplace?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankBranch?: string;
  damages?: string;
  approvers?: ContractApprover[];
}

export async function updateContract(
  id: string,
  details: ContractDetails,
): Promise<Contract> {
  const { approvers, ...detailsRest } = details;

  const data: any = { ...detailsRest };

  if (approvers) {
    const previousContract = await getContractById(id);

    let nextApprovers: ContractApprover[] = [];
    previousContract.approvers?.forEach((approver) => {
      if (!approvers.some((x) => x.key === approver.key)) {
        nextApprovers.push(approver);
      }
    });

    nextApprovers = [...nextApprovers, ...approvers];

    data.approvers = nextApprovers;
  }

  const response = await apiClient.put<ContractApi>({
    url: `/contract/${id}`,
    body: data,
  });

  return parseContract(response.result);
}
