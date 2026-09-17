"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaTrash } from "react-icons/fa6";

import { FieldError } from "@/form/FieldError";
import { CaseType } from "@/inspection/models/CaseType";
import { inspectionType } from "@/inspection/models/InspectionType";
import { messages } from "@/messages";
import { PriceInput } from "@/ui/MaskInput/PriceInput";
import { Panel } from "@/ui/Panel";
import Select from "@/ui/Select/Select";
import { Table } from "@/ui/Table";
import { toCurrency } from "@/utils/String";

import { ActionName } from "../../../models/ActionName";
import { CaseData } from "../../../models/CaseData";
import {
  CasePaymentStatus,
  casePaymentStatuses,
} from "../../../models/CasePaymentStatus";
import { ids } from "../../../models/Ids";
import { FormData } from "../PhasePage";
import CaseRemaining from "./CaseRemaining";

interface Props {
  cases: CaseData[];
  isActionsAllowed: boolean;
}

export default function CaseTable({ cases, isActionsAllowed }: Props) {
  const { control, setValue, watch } = useFormContext<FormData>();

  const { [ids.actionName]: actionName, [ids.paymentAmount]: paymentAmount } =
    watch();

  const isActionReceipt = useMemo<boolean>(
    () => !actionName || actionName === ActionName.Receipt,
    [actionName],
  );

  const [remaining, setRemaining] = useState<number>(0);
  const calculateRemaining = useCallback(
    (cases: CaseData[]) => {
      setRemaining(
        paymentAmount
          ? parseInt(paymentAmount) -
              cases
                .map((x) => (x.paymentAmount ? parseInt(x.paymentAmount) : 0))
                .reduce((a, b) => a + b, 0)
          : 0,
      );
    },
    [paymentAmount],
  );

  useEffect(() => {
    calculateRemaining(cases);
  }, [calculateRemaining, cases]);

  return (
    <div className="col-span-full">
      <label>درخواست ها:</label>
      {/* <Panel.Root className="overflow-auto h-fit mt-2 scrollbar-thin scrollbar-thumb-gray-100 scrollbar-thumb-rounded-lg"> */}
      <Panel.Root className="overflow-auto lg:overflow-visible mt-2">
        <Table.Root>
          <Table.Head>
            <Table.Row className="text-right bg-gray-100">
              {isActionsAllowed && (
                <Table.Cell as="th" className="w-16"></Table.Cell>
              )}
              <Table.Cell as="th" className="w-16">
                ردیف
              </Table.Cell>
              <Table.Cell as="th" className="w-44">
                اطلاعات درخواست
              </Table.Cell>
              <Table.Cell as="th" className="w-44">
                خریدار
              </Table.Cell>
              <Table.Cell as="th" className="w-60">
                فاکتور درخواست
              </Table.Cell>
              <Table.Cell as="th" className="w-44">
                مبلغ باقی مانده
              </Table.Cell>
              {isActionReceipt ? (
                <Table.Cell as="th">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span>عملیات پرداخت</span>
                    {!!paymentAmount && <CaseRemaining remaining={remaining} />}
                  </div>
                </Table.Cell>
              ) : (
                <Table.Cell as="th" />
              )}
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {cases?.map((data, i) => (
              <Table.Row key={data.caseNo}>
                {isActionsAllowed && (
                  <Table.Cell>
                    <Table.Actions>
                      <Table.Action
                        className="hover:text-red-500"
                        onClick={() => {
                          const nextCases = cases.filter(
                            (x) => x.caseNo !== data.caseNo,
                          );

                          setValue(ids.inspectionCases, nextCases, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });

                          if (nextCases.length === 0) {
                            setValue(ids.caseType, "" as CaseType, {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            });
                          }
                        }}
                      >
                        <FaTrash />
                      </Table.Action>
                    </Table.Actions>
                  </Table.Cell>
                )}
                <Table.Cell>{i + 1}</Table.Cell>
                <Table.Cell className="text-nowrap">
                  <div className="space-y-1">
                    <div>{inspectionType[data.inspectionType].title}</div>
                    <div className="text-gray-600 text-xs">
                      شماره: {data.caseNo}
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell className="text-nowrap">
                  <div className="flex flex-col">
                    <div>{data.buyer.name}</div>
                    {data.buyer.sepidarId && (
                      <div className="text-gray-600 text-xs">
                        شناسه سپیدار: {data.buyer.sepidarId}
                      </div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="text-nowrap">
                  <div className="space-y-1">
                    <div>
                      هزینه بازرسی: {toCurrency(data.inspectionFee)} ریال
                    </div>
                    <div>مالیات: {toCurrency(data.invoiceTax)} ریال</div>
                    <div>عوارض: {toCurrency(data.invoiceDuty)} ریال</div>
                    <div>مجموع: {toCurrency(data.invoiceTotal)} ریال</div>
                  </div>
                </Table.Cell>
                <Table.Cell className="text-nowrap">
                  {toCurrency(data.invoiceRemaining)} ریال
                </Table.Cell>
                {isActionReceipt ? (
                  <Table.Cell className="text-nowrap">
                    <div className="flex gap-x-6">
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor={`${ids.inspectionCases}.${i}.paymentAmount`}
                        >
                          مبلغ پرداختی:
                        </label>
                        <Controller
                          control={control}
                          name={`${ids.inspectionCases}.${i}.paymentAmount`}
                          render={({
                            field: { onBlur, ...field },
                            fieldState,
                          }) => (
                            <>
                              <PriceInput
                                className="max-w-48 min-w-40"
                                onBlur={(e) => {
                                  onBlur();
                                  calculateRemaining(
                                    cases.map((x, j) =>
                                      i !== j
                                        ? x
                                        : {
                                            ...x,
                                            paymentAmount:
                                              e.target.value.replaceAll(
                                                ",",
                                                "",
                                              ),
                                          },
                                    ),
                                  );
                                }}
                                {...field}
                              />
                              <FieldError error={fieldState.error} />
                            </>
                          )}
                          rules={{
                            deps: [`${ids.inspectionCases}.${i}.paymentStatus`],
                            required: messages.validation.required,
                            validate: (v) => {
                              if (
                                v &&
                                parseInt(v) > parseInt(data.invoiceRemaining)
                              ) {
                                return "مبلغ پرداختی نمی تواند بیشتر از مبلغ قابل پرداخت باشد.";
                              }
                            },
                          }}
                          shouldUnregister
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor={`${ids.inspectionCases}.${i}.paymentStatus`}
                        >
                          وضعیت پرداخت:
                        </label>
                        <Controller
                          control={control}
                          name={`${ids.inspectionCases}.${i}.paymentStatus`}
                          render={({ field, fieldState }) => (
                            <div>
                              <Select<CasePaymentStatus>
                                className="w-full min-w-64"
                                items={casePaymentStatuses}
                                {...field}
                              />
                              <FieldError error={fieldState.error} />
                            </div>
                          )}
                          rules={{
                            required: messages.validation.required,
                            validate: (v, values) => {
                              const caseType = values[ids.caseType];

                              const remaining =
                                parseInt(data.invoiceRemaining) -
                                parseInt(data.paymentAmount);
                              const isValidRemainingMargin =
                                remaining <= 100000; // Less than 100,000 IRR

                              if (v) {
                                if (
                                  v === CasePaymentStatus.Complete &&
                                  !isValidRemainingMargin
                                ) {
                                  return "امکان انتخاب این گزینه وجود ندارد.";
                                } else if (
                                  (v === CasePaymentStatus.Incomplete ||
                                    v === CasePaymentStatus.Ias) &&
                                  data.paymentAmount === data.invoiceRemaining
                                ) {
                                  return "امکان انتخاب این گزینه وجود ندارد.";
                                } else if (v === CasePaymentStatus.Ias) {
                                  if (caseType === CaseType.Unofficial) {
                                    return "امکان انتخاب این گزینه برای درخواست بازرسی غیررسمی وجود ندارد.";
                                  }

                                  const isValidIas =
                                    parseInt(data.invoiceRemaining) -
                                      parseInt(data.paymentAmount || "0") <=
                                    0.167 * parseInt(data.inspectionFee);
                                  if (!isValidIas) {
                                    return "امکان انتخاب این گزینه وجود ندارد.";
                                  }
                                }
                              }
                            },
                          }}
                          shouldUnregister
                        />
                      </div>
                    </div>
                  </Table.Cell>
                ) : (
                  <Table.Cell />
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Panel.Root>
    </div>
  );
}
