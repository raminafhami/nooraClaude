import { CaseData } from "../models/CaseData";

export function getCostsTotal(cases: CaseData[]): string {
  return cases
    .map((x) => parseInt(x.invoiceTotal))
    .reduce((a, b) => a + b, 0)
    .toString();
}
