import { DebtUserType } from "../enums/DebtUserType";

type DebtApi = {
  id: string;
  instanceId: string;
  userId: string;
  caseNo: string;
  userType: DebtUserType;
  amount: number;
  isPaid: boolean;
};

export type { DebtApi };
