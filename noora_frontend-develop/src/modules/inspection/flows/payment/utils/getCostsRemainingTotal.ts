import { CaseData } from "../models/CaseData";

export function getCostsRemainingTotal(cases: CaseData[]): string {
  return cases
    .map((x) => parseInt(x.invoiceRemaining))
    .reduce((a, b) => a + b, 0)
    .toString();
}
