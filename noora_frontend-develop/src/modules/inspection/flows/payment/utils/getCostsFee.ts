import { CaseData } from "../models/CaseData";

export function getCostsFee(cases: CaseData[]): string {
  return cases
    .map((x) => +x.inspectionFee)
    .reduce((a, b) => a + b, 0)
    .toString();
}
