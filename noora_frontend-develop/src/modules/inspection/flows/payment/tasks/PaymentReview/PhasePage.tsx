"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import payUserDebtByInstanceId from "@/api/debts/payUserDebtByInstanceId";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { DocumentsView } from "@/felo/files/components/documents-view/DocumentsView";
import { getInstances } from "@/felo/instances/services/getInstances";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { CostCaseStatus } from "@/financial/costs/enums/CostCaseStatus";
import { updateCostsByCase } from "@/financial/costs/services/updateCostsByCase";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import {
  InvoicePaymentRequests,
  InvoicePaymentRequestStatus,
} from "@/inspection/models/InvoicePaymentRequest";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";
import { toCurrency } from "@/utils/String";

import { bankAccounts } from "../../data/BankAccounts";
import { AssigneeType } from "../../models/Assignee";
import { CaseData } from "../../models/CaseData";
import { CasePaymentStatus } from "../../models/CasePaymentStatus";
import { ids } from "../../models/Ids";
import {
  PaymentReviewStatus,
  paymentReviewStatusOptions,
} from "../../models/PaymentReviewStatus";
import {
  PaymentType,
  paymentType as paymentTypeType,
} from "../../models/PaymentTypes";
import CaseTable from "./_module/CaseTable";
import { schema } from "./PhaseSchema";

export type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();
	const { data } = task;

	const paymentType: PaymentType = data[ids.paymentType];

	const { control, register, watch } = useFormContext<FormData>();

	const { [ids.paymentReviewStatus]: reviewStatus } = watch();

	useEffect(() => {
		register(ids.assignees);
	}, [register]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					// set assignee
					const { id, fullname: name } = identity;
					data[ids.assignees][AssigneeType.FinancialExpert] = { id, name };

					const reviewStatus = data[ids.paymentReviewStatus];
					if (reviewStatus === PaymentReviewStatus.Confirm) {
						/* check and update instances */
						const caseItems: CaseData[] = task.data["CaseItems"];

						const instances = await getInstances({
							filters: [
								{ name: "_id", value: caseItems.map((x) => x.instanceId) },
							],
							props: ["InvoicePaymentRequests", "InvoiceRemaining"],
						});

						if (instances.length !== caseItems.length) {
							throw new Error();
						}

						await Promise.all(
							caseItems.map(async (caseItem) => {
								const instance = instances.find(
									(x) => x.id === caseItem.instanceId,
								)!;
								const parameters = instance.parameters;

								const paymentRequests: InvoicePaymentRequests =
									parameters["InvoicePaymentRequests"];

								const paymentRequest = paymentRequests.pop()!;

								if (paymentRequest.instanceId === task.instanceId) {
									// try resolve invoice remaining for old inspection instances
									const previousInvoiceRemaining =
										parseInt(parameters["InvoiceRemaining"]) ||
										parseInt(caseItem.invoiceRemaining);

									await updateInstanceData(instance.id, {
										InvoicePaymentRequests: [
											...paymentRequests,
											{
												...paymentRequest,
												payment: {
													paymentDate: task.data[ids.paymentDate],
												},
												status: InvoicePaymentRequestStatus.Confirmed,
											},
										] as InvoicePaymentRequests,
										InvoicePaymentStatus:
											caseItem.paymentStatus !== CasePaymentStatus.Incomplete
												? InvoicePaymentStatus.Paid
												: InvoicePaymentStatus.PartiallyPaid,
										InvoiceRemaining: (
											previousInvoiceRemaining -
											parseInt(caseItem.paymentAmount)
										).toString(),
									});
								}
							}),
						);

						await Promise.all(
							caseItems.map(async (caseItem) => {
								await updateCostsByCase({
									instanceId: caseItem.instanceId,
									status:
										caseItem.paymentStatus !== CasePaymentStatus.Incomplete
											? CostCaseStatus.Paid
											: CostCaseStatus.PartiallyPaid,
								});
							}),
						);

						/* update values */
						data[ids.paymentReviewNote] = "";

						try {
							let res = await payUserDebtByInstanceId({
								instanceId: caseItems.map((x) => x.instanceId),
							});
							if (res) {
								toast.success("تسویه بدهی با موفقیت انجام شد");
							}
						} catch {
							throw new Error("تسویه بدهی با خطا مواجه شد");
						}
					}
				},
			);
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<DocumentsView
					instanceId={task.instanceId}
					folders={["receipts"]}
					requiredTypes={["receipt"]}
				/>

				<Referrer
					assigneeKey={AssigneeType.Initiator}
					noteId={ids.paymentFormNote}
				/>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label>نوع پرداخت:</label>
					<Input
						defaultValue={
							paymentTypeType[data[ids.paymentType] as PaymentType]?.title ||
							"-"
						}
						disabled
					/>
				</div>

				{(data[ids.paymentType] === PaymentType.BankDeposit ||
					data[ids.paymentType] === PaymentType.BankGateway) && (
					<>
						<div className="col-span-3 col-start-1 space-y-2">
							<label>حساب بانکی:</label>
							<Input
								defaultValue={
									bankAccounts.find((x) => x.value === data[ids.bankAccount])
										?.label || "-"
								}
								disabled
							/>
						</div>

						<div className="col-span-3 space-y-2">
							<label>شماره رسید واریزی:</label>
							<Input defaultValue={data[ids.receiptNo]} disabled />
						</div>
					</>
				)}

				<div className="col-span-3 col-start-1 space-y-2">
					<label>تاریخ پرداختی:</label>
					<Input defaultValue={data[ids.paymentDate]} disabled />
				</div>

				<div className="col-span-3 space-y-2">
					<label>مبلغ پرداختی:</label>
					<Input defaultValue={toCurrency(data[ids.paymentAmount])} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label>نوع درخواست:</label>
					<Input
						defaultValue={caseType[data[ids.caseType] as CaseType]}
						disabled
					/>
				</div>

				{data[ids.assignees][AssigneeType.Payer] && (
					<div className="col-span-3 space-y-2">
						<label>نماینده/مشتری:</label>
						<Input
							defaultValue={`${data[ids.payerSepidarId] ?? "؟"} - ${
								data[ids.assignees][AssigneeType.Payer].name
							}`}
							disabled
						/>
					</div>
				)}

				<CaseTable />

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.paymentReviewStatus}>نتیجه بررسی:</label>
					<Controller
						control={control}
						name={ids.paymentReviewStatus}
						render={({ field, fieldState }) => (
							<>
								<Select
									id={field.name}
									items={paymentReviewStatusOptions}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							deps: [ids.paymentReviewNote],
							required: messages.validation.required,
							validate: (value) => {
								if (
									paymentType === PaymentType.BankGateway &&
									value === PaymentReviewStatus.Return
								) {
									return "امکان بازگشت در نوع پرداخت «درگاه بانکی» وجود ندارد.";
								}
							},
						}}
					/>
				</div>

				{reviewStatus && reviewStatus !== PaymentReviewStatus.Confirm && (
					<div className="col-span-full col-start-1 space-y-2">
						<label htmlFor={ids.paymentReviewNote}>توضیحات بررسی:</label>
						<Controller
							control={control}
							name={ids.paymentReviewNote}
							render={({ field, fieldState }) => (
								<>
									<Textarea id={field.name} {...field} />
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{
								deps: [ids.paymentReviewNote],
								required: messages.validation.required,
							}}
							shouldUnregister
						/>
					</div>
				)}
			</div>
		</>
	);
}
