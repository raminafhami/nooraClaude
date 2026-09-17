"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getInstanceRawFiles } from "@/felo/files/services/getRawFiles";
import { getInstances } from "@/felo/instances/services/getInstances";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import { inspectionType } from "@/inspection/models/InspectionType";
import {
  InvoicePaymentRequest,
  InvoicePaymentRequests,
  InvoicePaymentRequestStatus,
} from "@/inspection/models/InvoicePaymentRequest";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";
import { messages } from "@/messages";
import { PriceInput } from "@/ui/MaskInput/PriceInput";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { bankAccounts } from "../../data/BankAccounts";
import { ActionName, actionNameOptions } from "../../models/ActionName";
import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import {
  PaymentFormStatus,
  paymentFormStatuses,
} from "../../models/PaymentFormStatus";
import { PaymentReviewStatus } from "../../models/PaymentReviewStatus";
import { PaymentType, paymentTypeOptions } from "../../models/PaymentTypes";
import CaseWidget from "./_module/CaseWidget";
import { schema } from "./PhaseSchema";

export type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	const { control, register, resetField, setValue, watch } =
		useFormContext<FormData>();

	const {
		[ids.actionName]: actionName,
		[ids.assignees]: assignees,
		[ids.isCaseActionsAllowed]: isCaseActionsAllowed,
		[ids.paymentFormStatus]: status,
		[ids.paymentType]: paymentType,
	} = watch();

	const isActionReceipt = useMemo<boolean>(
		() =>
			task.instanceVersion >= 2
				? actionName === ActionName.Receipt
				: !actionName || actionName === ActionName.Receipt,
		[actionName, task.instanceVersion],
	);

	const isBankingPayment = useMemo<boolean>(
		() => paymentType === PaymentType.BankDeposit,
		[paymentType],
	);

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		register(ids.assignees);
	}, [register]);

	useEffect(() => {
		if (!assignees || typeof assignees !== "object") {
			resetField(ids.assignees, { defaultValue: {} });
		}
	}, [assignees, resetField]);

	useEffect(() => {
		if (isCaseActionsAllowed) {
			setValue(ids.paymentFormStatus, PaymentFormStatus.Forward);
		}
	}, [isCaseActionsAllowed, setValue]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ data, task }: { data: FormData; task: Task }) => {
					/* validate payment amount with accumulated cases payment amounts */
					const remaining = data[ids.paymentAmount]
						? parseInt(data[ids.paymentAmount]) -
							data[ids.inspectionCases]
								.map((x) => (x.paymentAmount ? parseInt(x.paymentAmount) : 0))
								.reduce((a, b) => a + b, 0)
						: 0;

					if (remaining !== 0) {
						throw new Error(
							"مبلغ پرداخت شده با مجموع مبلغ پرداختی درخواست ها مغایرت دارد.",
						);
					}

					// reject if there are no items in the table
					const caseItems = data["CaseItems"];
					if (!caseItems?.length) {
						throw new Error("هیچ درخواستی در جدول درخواست ها اضافه نشده است.");
					}

					// reject if there is no documents in receipts folder
					if (
						!isFieldInTaskForm(task, ids.actionName) ||
						data[ids.actionName] === ActionName.Receipt
					) {
						const documents = await getInstanceRawFiles({
							instanceId: task.instanceId,
							types: ["receipt"],
						});
						if (!documents.length) {
							throw new Error("رسید پرداختی بارگذاری نشده است.");
						}
					}

					/* check and update instances */
					const instances = await getInstances({
						filters: [
							{ name: "_id", value: caseItems.map((x) => x.instanceId) },
						],
						props: ["InvoicePaymentRequests", "InvoicePaymentStatus"],
					});

					if (instances.length !== caseItems.length) {
						throw new Error(
							"the number of fetched instances is not equal to the number of case items.",
						);
					}

					await Promise.all(
						data["CaseItems"].map(async (caseItem) => {
							const instance = instances.find(
								(x) => x.id === caseItem.instanceId,
							)!;
							const parameters = instance.parameters || {};

							const paymentRequests: InvoicePaymentRequests | null =
								parameters["InvoicePaymentRequests"];
							const paymentRequest: InvoicePaymentRequest | null =
								paymentRequests?.at(-1) || null;
							const paymentStatus: InvoicePaymentStatus =
								parameters["InvoicePaymentStatus"];

							if (data[ids.paymentFormStatus] === PaymentFormStatus.Forward) {
								if (
									paymentRequest &&
									paymentRequest.status ===
										InvoicePaymentRequestStatus.Pending &&
									paymentRequest.instanceId !== task.instanceId
								) {
									throw new Error(
										`درخواست ${
											inspectionType[caseItem.inspectionType]?.title
										} ${caseItem.caseNo} در درخواست وصول ${
											paymentRequest.caseNo
										} در حال پیگیری است.`,
									);
								}

								if (
									paymentStatus === InvoicePaymentStatus.Paid ||
									paymentStatus === InvoicePaymentStatus.Pending ||
									(paymentRequest &&
										paymentRequest.status ===
											InvoicePaymentRequestStatus.Pending &&
										paymentRequest.instanceId === task.instanceId)
								) {
									return;
								}

								await updateInstanceData(instance.id, {
									InvoicePaymentRequests: [
										...(paymentRequests ?? []),
										{
											instanceId: task.instanceId,
											caseNo: task.caseNo,
											status: InvoicePaymentRequestStatus.Pending,
										},
									],
									InvoicePaymentStatus: InvoicePaymentStatus.Pending,
								});
							} else if (
								data[ids.paymentFormStatus] === PaymentFormStatus.Cancel
							) {
								if (
									!paymentRequests ||
									!paymentRequest ||
									paymentStatus === InvoicePaymentStatus.Unpaid ||
									paymentStatus === InvoicePaymentStatus.PartiallyPaid
								) {
									return;
								}

								await updateInstanceData(instance.id, {
									InvoicePaymentRequests: [
										...paymentRequests.slice(0, -1),
										{
											...paymentRequest,
											status: InvoicePaymentRequestStatus.Canceled,
										},
									],
									InvoicePaymentStatus:
										paymentRequests.findIndex(
											(x) => x.status === InvoicePaymentRequestStatus.Confirmed,
										) === -1
											? InvoicePaymentStatus.Unpaid
											: InvoicePaymentStatus.PartiallyPaid,
								});
							}
						}),
					);

					/* set assignee */
					const { id, fullname: name } = identity;
					data[ids.assignees][AssigneeType.Initiator] = { id, name };

					/* update values */
					data[ids.isCaseActionsAllowed] = "false";
				},
			);
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-1 gap-y-6 md:grid-cols-12 md:gap-x-10">
				{task.data[ids.paymentReviewStatus] === PaymentReviewStatus.Return && (
					<>
						<Referrer
							assigneeKey={AssigneeType.FinancialExpert}
							noteId={ids.paymentReviewNote}
							noteType="danger"
						/>

						<Seperator className="mt-5" />
					</>
				)}

				{task.instanceVersion >= 2 && (
					<>
						<div className="col-span-full col-start-1 space-y-2 md:col-span-3">
							<label htmlFor={ids.actionName}>عملیات:</label>
							<Controller
								control={control}
								name={ids.actionName}
								render={({ field, fieldState }) => (
									<>
										<Select
											disabled={isCaseActionsAllowed === "false"}
											id={field.name}
											items={actionNameOptions}
											{...field}
										/>
										<FieldError error={fieldState.error} />
									</>
								)}
								rules={{
									required: messages.validation.required,
								}}
								shouldUnregister={isCaseActionsAllowed === "false"}
							/>
						</div>

						<Seperator className="mt-5" />
					</>
				)}

				{isActionReceipt && (
					<>
						<div className="col-span-full col-start-1 space-y-2 md:col-span-3">
							<label htmlFor={ids.paymentType}>نوع پرداخت:</label>
							<Controller
								control={control}
								name={ids.paymentType}
								render={({ field, fieldState }) => (
									<>
										<Select
											id={field.name}
											items={paymentTypeOptions}
											{...field}
										/>
										<FieldError error={fieldState.error} />
									</>
								)}
								rules={{
									required: messages.validation.required,
								}}
								shouldUnregister
							/>
						</div>

						{isBankingPayment && (
							<>
								<div className="col-span-3 col-start-1 space-y-2">
									<label htmlFor={ids.bankAccount}>حساب بانکی:</label>
									<Controller
										control={control}
										name={ids.bankAccount}
										render={({ field, fieldState }) => (
											<>
												<Select
													id={field.name}
													items={bankAccounts}
													{...field}
												/>
												<FieldError error={fieldState.error} />
											</>
										)}
										rules={{
											required: messages.validation.required,
										}}
										shouldUnregister
									/>
								</div>

								<div className="col-span-3 space-y-2">
									<label htmlFor={ids.receiptNo}>شماره رسید واریزی:</label>
									<Controller
										control={control}
										name={ids.receiptNo}
										render={({ field, fieldState }) => (
											<>
												<Input id={field.name} {...field} />
												<FieldError error={fieldState.error} />
											</>
										)}
										rules={{
											required: messages.validation.required,
										}}
										shouldUnregister
									/>
								</div>
							</>
						)}

						<div className="col-span-3 col-start-1 space-y-2">
							<label htmlFor={ids.paymentDate}>تاریخ پرداختی:</label>
							<Controller
								control={control}
								name={ids.paymentDate}
								render={({
									field: { onBlur, onChange, ref, ...field },
									fieldState,
								}) => (
									<>
										<DateInput
											id={field.name}
											onLeave={onBlur}
											onMutate={onChange}
											{...field}
										/>
										<FieldError error={fieldState.error} />
									</>
								)}
								rules={{
									required: messages.validation.required,
								}}
								shouldUnregister
							/>
						</div>

						<div className="col-span-3 space-y-2">
							<label htmlFor={ids.paymentAmount}>مبلغ پرداختی:</label>
							<Controller
								control={control}
								name={ids.paymentAmount}
								render={({ field, fieldState }) => (
									<>
										<PriceInput id={field.name} {...field} />
										<FieldError error={fieldState.error} />
									</>
								)}
								rules={{
									required: messages.validation.required,
								}}
								shouldUnregister
							/>
						</div>

						<Seperator className="mt-5" />
					</>
				)}

				<CaseWidget />

				<Seperator className="mt-5" />

				{isCaseActionsAllowed === "false" && (
					<div className="col-span-3 col-start-1 space-y-2">
						<label htmlFor={ids.paymentFormStatus}>وضعیت:</label>
						<Controller
							control={control}
							name={ids.paymentFormStatus}
							render={({ field, fieldState }) => (
								<>
									<Select
										id={field.name}
										items={paymentFormStatuses}
										{...field}
									/>
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{
								deps: [ids.paymentFormNote],
								required: messages.validation.required,
							}}
						/>
					</div>
				)}

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.paymentFormNote}>توضیحات:</label>
					<Controller
						control={control}
						name={ids.paymentFormNote}
						render={({ field, fieldState }) => (
							<>
								<Textarea id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required:
								status !== PaymentFormStatus.Forward &&
								messages.validation.required,
						}}
					/>
				</div>
			</div>
		</>
	);
}
