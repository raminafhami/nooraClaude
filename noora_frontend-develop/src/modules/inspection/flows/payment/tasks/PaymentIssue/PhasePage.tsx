"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { DocumentsView } from "@/felo/files/components/documents-view/DocumentsView";
import { getInstances } from "@/felo/instances/services/getInstances";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import {
  InvoicePaymentRequests,
  InvoicePaymentRequestStatus,
} from "@/inspection/models/InvoicePaymentRequest";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";
import { Seperator } from "@/ui/Seperator";
import { toCurrency } from "@/utils/String";

import { bankAccounts } from "../../data/BankAccounts";
import {
  actionName as actionNameTemplate,
  ActionName,
} from "../../models/ActionName";
import { AssigneeType } from "../../models/Assignee";
import { CaseData } from "../../models/CaseData";
import { ids } from "../../models/Ids";
import { instanceIds } from "../../models/InstanceIds";
import { PaymentType, paymentType } from "../../models/PaymentTypes";
import CaseWidget from "./_module/CaseWidget";
import { schema } from "./PhaseSchema";

export type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks, dispatch } = useTaskContext();
	const { data } = task;

	const { control } = useFormContext<FormData>();

	const { [ids.actionName]: actionName } = data;

	const isActionReceipt = useMemo<boolean>(
		() => !actionName || actionName === ActionName.Receipt,
		[actionName],
	);

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					// update instances invoice nos
					await Promise.all(
						data[ids.inspectionCases].map(async (caseItem) => {
							await updateInstanceData(caseItem.instanceId, {
								CaseInvoiceNo: caseItem.invoiceNo,
								CaseInvoiceDate: caseItem.invoiceDate,
							});
						}),
					);

					const actionName = task.data[ids.actionName];
					if (actionName === ActionName.Invoice) {
						/* check and update instances */
						const caseItems: CaseData[] = data[ids.inspectionCases];

						const instances = await getInstances({
							filters: [
								{ name: "_id", value: caseItems.map((x) => x.instanceId) },
							],
							props: ["InvoicePaymentRequests"],
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
									const invoicePaymentStatus: InvoicePaymentStatus =
										parameters[instanceIds.invoiceRemaining] ===
										parameters[instanceIds.invoiceTotal]
											? InvoicePaymentStatus.Unpaid
											: parameters[instanceIds.invoiceRemaining] === "0"
												? InvoicePaymentStatus.Paid
												: InvoicePaymentStatus.PartiallyPaid;

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
											caseItem.previousPaymentStatus ?? invoicePaymentStatus,
									});
								}
							}),
						);
					}
				},
			);
		}
	}, [hooks]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				{(task.data[ids.actionName] === undefined ||
					task.data[ids.actionName] === ActionName.Receipt) && (
					<DocumentsView
						instanceId={task.instanceId}
						folders={["receipts"]}
						requiredTypes={["receipt"]}
					/>
				)}

				<Referrer
					assigneeKey={AssigneeType.Initiator}
					noteId={ids.paymentFormNote}
				/>

				<Seperator className="mt-5" />

				{data[ids.actionName] && (
					<>
						<div className="col-span-3 col-start-1 space-y-2">
							<label>عملیات:</label>
							<Input
								defaultValue={
									actionNameTemplate[data[ids.actionName] as ActionName] || "-"
								}
								disabled
							/>
						</div>

						<Seperator className="mt-5" />
					</>
				)}

				{isActionReceipt && (
					<>
						<div className="col-span-3 col-start-1 space-y-2">
							<label>نوع پرداخت:</label>
							<Input
								defaultValue={
									paymentType[data[ids.paymentType] as PaymentType]?.title ||
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
											bankAccounts.find(
												(x) => x.value === data[ids.bankAccount],
											)?.label || "-"
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
							<Input
								defaultValue={toCurrency(data[ids.paymentAmount])}
								disabled
							/>
						</div>

						<Seperator className="mt-5" />
					</>
				)}

				<CaseWidget />

				<Seperator className="mt-5" />

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.paymentIssueNote}>توضیحات:</label>
					<Controller
						control={control}
						name={ids.paymentIssueNote}
						render={({ field }) => <Textarea id={field.name} {...field} />}
					/>
				</div>
			</div>
		</>
	);
}
