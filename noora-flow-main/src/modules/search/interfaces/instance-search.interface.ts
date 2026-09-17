export interface InstanceSearchBody {
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
  parameters: Record<string, any>;
  maxPossibleDuration: number;
}
export interface InstanceSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: InstanceSearchBody;
    }>;
  };
}
