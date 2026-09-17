"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { Input } from "@/form/Input";
import { CaseType, caseType } from "@/inspection/models/CaseType";

import { AssigneeType } from "../../../models/Assignee";
import { CaseData } from "../../../models/CaseData";
import { CasePayer } from "../../../models/CasePayer";
import { ids } from "../../../models/Ids";
import { FormData } from "../PhasePage";
import CaseFormAdd from "./CaseFormAdd";
import CaseTable from "./CaseTable";

export default function CaseWidget() {
  const { register, resetField, setValue, watch } = useFormContext<FormData>();

  const {
    [ids.assignees]: assignees,
    [ids.actionName]: actionName,
    [ids.caseType]: casesType,
    [ids.isCaseActionsAllowed]: isCaseActionsAllowed,
    [ids.inspectionCases]: cases,
    [ids.payerSepidarId]: payerSepidarId,
  } = watch();

  const isActionsAllowed = useMemo(
    () => !isCaseActionsAllowed || isCaseActionsAllowed === "true",
    [isCaseActionsAllowed],
  );

  useEffect(() => {
    register(ids.isCaseActionsAllowed);
    register(ids.inspectionCases, { deps: [ids.paymentAmount] });
    register(ids.caseType);
  }, [register]);

  useEffect(() => {
    if (isCaseActionsAllowed === undefined) {
      resetField(ids.isCaseActionsAllowed, { defaultValue: "true" });
    }
  }, [isCaseActionsAllowed, resetField]);

  useEffect(() => {
    if (!cases) {
      resetField(ids.inspectionCases, { defaultValue: [] });
    }
  }, [cases, resetField]);

  const handleCaseAdd = useCallback(
    (type: CaseType, data: CaseData, payer: CasePayer | null) => {
      if (cases.length === 0) {
        setValue(ids.caseType, type);

        if (!assignees[AssigneeType.Payer] && payer) {
          setValue(ids.assignees, {
            ...assignees,
            [AssigneeType.Payer]: {
              id: payer.id,
              name: payer.name,
            },
          });
          setValue(ids.payerSepidarId, payer.sepidarId);
        }
      }

      setValue(ids.inspectionCases, [...cases, { ...data }]);
    },
    [assignees, cases, setValue],
  );

  return (
    <>
      {isActionsAllowed && (
        <CaseFormAdd
          actionName={actionName}
          caseNos={cases?.map((x) => x.caseNo) ?? []}
          caseType={casesType}
          payerId={assignees?.[AssigneeType.Payer]?.id ?? null}
          onAdd={handleCaseAdd}
        />
      )}

      {casesType && (
        <div className="col-span-3 space-y-2 col-start-1">
          <label>نوع درخواست:</label>
          <Input disabled value={caseType[casesType]} />
        </div>
      )}

      {assignees?.[AssigneeType.Payer] && (
        <div className="col-span-3 space-y-2">
          <label>نماینده/مشتری:</label>
          <Input
            disabled
            value={`${payerSepidarId ?? "؟"} - ${
              assignees[AssigneeType.Payer]?.name
            }`}
          />
        </div>
      )}

      <CaseTable cases={cases} isActionsAllowed={isActionsAllowed} />
    </>
  );
}
