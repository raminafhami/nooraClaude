import parseUser from "@/identity/users/utils/parseUser";

import { Contract } from "../models/Contract";
import { ContractApi } from "../models/ContractApi";

export function parseContract(from: ContractApi): Contract;

export function parseContract(from: ContractApi[]): Contract[];

export function parseContract(
  from: ContractApi | ContractApi[],
): Contract | Contract[] {
  if (Array.isArray(from)) {
    return from.map((x) => parseContract(x));
  }

  let result: Contract = {
    id: from.id,
    userId: from.userId ?? from.user.id,
    username: from.user?.username,
    firstname: from.user?.name,
    lastname: from.user?.lastname,
    fullname: `${from.user?.name} ${from.user?.lastname}`,
    nationalCode: from.user?.nationalCode,
    phoneNo: from.user?.phoneNo,
    email: from.user?.email,
    jobs: from.jobs,
    contractNo: from.contractNo,
    startDate: from.startDate,
    endDate: from.endDate,
    signDate: from.signDate,
    period: from.period,
    salaryAmount: from.salaryAmount,
    salaryType: from.salaryType,
    status: from.status,
    workplace: from.workplace,
    bankAccountNumber: from.bankAccountNumber,
    bankName: from.bankName,
    bankBranch: from.bankBranch,
    damages: from.damages,
    approvers:
      from.approvers?.map((x) => ({
        ...x,
        userId: typeof x.userId === "string" ? x.userId : x.userId.id,
        user: typeof x.userId === "object" ? parseUser(x.userId) : undefined,
      })) ?? [],
  };

  return result;
}
