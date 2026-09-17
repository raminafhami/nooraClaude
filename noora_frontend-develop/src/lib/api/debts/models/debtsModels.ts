import { User } from "@/identity/users/models/User";

export interface GetOwnDebtsResult {
  statusCode: number;
  message: string;
  result: Result;
}

export interface CreateOwnDebtsResult {
  statusCode: number;
  message: string;
  result: OwnDebts[];
}

export interface Result {
  data: OwnDebts[];
  count: number;
  remainedCredit: number;
}

export interface OwnDebts {
  amount: number;
  isPaid: boolean;
  userId: User;
  instanceId: string;
  caseNo: string;
  id: string;
  userType?: string;
}
