import { CaseData } from "../models/CaseData";

export function getCostsTaxAndToll(cases: CaseData[]): string {
  return cases
    .map((x) => +x.invoiceTax + +x.invoiceDuty)
    .reduce((a, b) => a + b, 0)
    .toString();
}
