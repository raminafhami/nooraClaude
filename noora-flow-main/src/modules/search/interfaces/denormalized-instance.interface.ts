export interface IDenormalizedInstanceSearchBody {
  id: string;
  caseNo: string;
  processDefinitionKey: string;
  currentState: string;
  status: string;
  year: number;
  month: number;
  dayOfYear: number;
  weekOfYear: number;
  date: string;
  jalaliDate: string;
  parameters: Record<string, any>;
  inspectionCosts: any[];
  debts: any[];
}
