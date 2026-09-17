export interface IInspectionCostSearchBody {
  id: string;
  caseId: string;
  year: number;
  month: number;
  dayOfYear: number;
  weekOfYear: number;
  caseNo: string;
  caseStatus: string;
  currency: string;
  personId: string;
  personName: string;
  status: string;
  title: string;
  total: number;
  amount: number;
  method: string;
  type: string;
}
