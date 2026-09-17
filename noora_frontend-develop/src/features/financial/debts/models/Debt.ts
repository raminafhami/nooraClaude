import { DebtStatus } from "../enums/DebtStatus";
import { DebtUserType } from "../enums/DebtUserType";

type Debt = {
  id: string;
  instanceId: string;
  userId: string;
  caseNo: string;
  userType: DebtUserType;
  amount: number;
  status: DebtStatus;
};

export type { Debt };
