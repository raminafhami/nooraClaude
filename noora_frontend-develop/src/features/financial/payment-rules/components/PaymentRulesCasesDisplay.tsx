import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { FaTimes } from "react-icons/fa";

import { caseType } from "@/inspection/models/CaseType";
import { inspectionMethod } from "@/inspection/models/InspectionMethod";
import { inspectionRole } from "@/inspection/models/InspectionRoles";
import { inspectionType } from "@/inspection/models/InspectionType";

import { PaymentRuleCaseItem } from "./PaymentRuleCaseItem";

interface FormData {
  cases: PaymentRuleCaseItem[];
}

function PaymentRulesCasesDisplay() {
  const { setValue, watch } = useFormContext<FormData>();

  const { cases } = watch();

  function handleCaseDelete(caseIndex: number) {
    const updatedCases = cases.filter((_, i) => i !== caseIndex);
    setValue("cases", updatedCases, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="col-span-2 col-start-1 space-y-3">
      <div>لیست شرایط:</div>

      <div className="px-6 py-3 border-s-4 border-gray-200 rounded-xl bg-gray-100">
        {cases && cases.length !== 0 ? (
          cases.map((caseItem, index) => (
            <div className="mt-1.5 first:mt-0" key={index}>
              <div className="flex items-center">
                <div>
                  <FaTimes
                    className="w-4 h-4 p-0.5 rounded bg-gray-200 cursor-pointer transition-colors hover:bg-red-100 hover:text-red-900"
                    onClick={() => {
                      handleCaseDelete(index);
                    }}
                  />
                </div>

                <div className="ms-2">
                  {[
                    caseItem.inspectionType &&
                      inspectionType[caseItem.inspectionType].title,
                    caseItem.caseType && caseType[caseItem.caseType],
                    caseItem.inspectionMethod &&
                      inspectionMethod[caseItem.inspectionMethod],
                    caseItem.role && inspectionRole[caseItem.role],
                  ]
                    .filter((x) => x)
                    .join("، ")}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div key="empty">-</div>
        )}
      </div>
    </div>
  );
}

export default memo(PaymentRulesCasesDisplay);
