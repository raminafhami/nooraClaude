import { memo } from "react";
import { Controller, useForm, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { caseTypes } from "@/inspection/models/CaseType";
import { inspectionMethodOptions } from "@/inspection/models/InspectionMethod";
import { inspectionRoleOptions } from "@/inspection/models/InspectionRoles";
import { inspectionTypes } from "@/inspection/models/InspectionType";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import {
  PaymentRuleCaseItem,
  PaymentRuleCaseItemKey,
} from "./PaymentRuleCaseItem";
import PaymentRulesCasesDisplay from "./PaymentRulesCasesDisplay";

interface Props {
  conditions: Partial<{ [key in PaymentRuleCaseItemKey]: boolean }>;
}

interface ParentFormData {
  cases: PaymentRuleCaseItem[];
}

interface CasesFormData extends PaymentRuleCaseItem {}

function getDefaultValues() {
  const defaultValues: CasesFormData = {
    inspectionType: null,
    caseType: null,
    inspectionMethod: null,
    role: null,
  };

  return defaultValues;
}

function PaymentRulesCasesForm({ conditions }: Props) {
  const parentForm = useFormContext<ParentFormData>();

  const { cases } = parentForm.watch();

  const { control, reset, watch } = useForm<CasesFormData>({
    defaultValues: getDefaultValues(),
  });

  const { inspectionType, caseType, inspectionMethod, role } = watch();

  function handleSubmit(values: CasesFormData) {
    parentForm.setValue("cases", [...cases, values], {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    reset(getDefaultValues());
  }

  return (
    <div className="col-span-full space-y-2">
      <label>شرایط:</label>
      <div className="p-4 border border-gray-200 rounded-xl space-y-2">
        {conditions.inspectionType && (
          <div className="flex gap-x-4">
            <label className="basis-24 pt-2 shrink-0" htmlFor="inspectionType">
              نوع بازرسی:
            </label>
            <div className="grow">
              <Controller
                control={control}
                name="inspectionType"
                render={({ field }) => (
                  <Select items={inspectionTypes} optional {...field} />
                )}
              />
            </div>
          </div>
        )}

        {conditions.caseType && (
          <div className="flex gap-x-4">
            <label className="basis-24 pt-2 shrink-0" htmlFor="caseType">
              نوع درخواست:
            </label>
            <div className="grow">
              <Controller
                control={control}
                name="caseType"
                render={({ field }) => (
                  <Select items={caseTypes} optional {...field} />
                )}
              />
            </div>
          </div>
        )}

        {conditions.inspectionMethod && (
          <div className="flex gap-x-4">
            <label
              className="basis-24 pt-2 shrink-0"
              htmlFor="inspectionMethod"
            >
              روش بازرسی:
            </label>
            <div className="grow">
              <Controller
                control={control}
                name="inspectionMethod"
                render={({ field }) => (
                  <Select items={inspectionMethodOptions} optional {...field} />
                )}
              />
            </div>
          </div>
        )}

        {conditions.role && (
          <div className="flex col-span-2 col-start-1 gap-x-4">
            <label className="basis-24 pt-2 shrink-0" htmlFor="role">
              نقش:
            </label>
            <div className="grow">
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select items={inspectionRoleOptions} optional {...field} />
                )}
              />
            </div>
          </div>
        )}

        <div className="flex col-span-2 col-start-1 gap-x-4">
          <Button
            className="ms-28"
            disabled={
              !inspectionType && !caseType && !inspectionMethod && !role
            }
            type="button"
            onClick={() => {
              handleSubmit({ ...watch() });
            }}
          >
            افزودن شرایط
          </Button>
        </div>

        <Seperator className="!my-5" />

        <PaymentRulesCasesDisplay />
      </div>
    </div>
  );
}

export default memo(PaymentRulesCasesForm);
