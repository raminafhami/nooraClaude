export interface DebtSearchBody {
  id: string;
  caseNo: string;
  userType: string;
  year: number;
  month: number;
  dayOfYear: number;
  weekOfYear: number;
  date: string;
  user: {
    id: string;
    name: string;
    phoneNo: string;
  };
  instanceId: string;
  isPaid: boolean;
  amount: number;
}
