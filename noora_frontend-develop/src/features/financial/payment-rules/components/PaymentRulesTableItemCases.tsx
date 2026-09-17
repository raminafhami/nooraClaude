import { caseType } from "@/inspection/models/CaseType";
import { inspectionMethod } from "@/inspection/models/InspectionMethod";
import { inspectionRole } from "@/inspection/models/InspectionRoles";
import { inspectionType } from "@/inspection/models/InspectionType";

import { PaymentRuleCaseItem } from "./PaymentRuleCaseItem";

interface Props {
  cases: PaymentRuleCaseItem[];
}

function PaymentRulesTableItemCases({ cases }: Props) {
  if (!cases.length) {
    return "-";
  }

  return (
    <div className="flex flex-wrap gap-x-1 gap-y-1">
      {cases.map((caseItem, index) => {
        const labels: string[] = [];

        if (caseItem.inspectionType) {
          labels.push(inspectionType[caseItem.inspectionType].title);
        }

        if (caseItem.caseType) {
          labels.push(caseType[caseItem.caseType]);
        }

        if (caseItem.inspectionMethod) {
          labels.push(inspectionMethod[caseItem.inspectionMethod]);
        }

        if (caseItem.role) {
          labels.push(inspectionRole[caseItem.role]);
        }

        if (!labels.length) {
          return;
        }

        return (
          <span
            className="px-2 py-0.5 border border-gray-300 rounded-xl text-xs"
            key={index}
          >
            {labels.join("، ")}
          </span>
        );
      })}
    </div>
  );
}

export default PaymentRulesTableItemCases;
