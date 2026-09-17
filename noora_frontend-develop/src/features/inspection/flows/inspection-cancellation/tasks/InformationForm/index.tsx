"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaMagnifyingGlass, FaPencil } from "react-icons/fa6";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  InstanceCancelReason,
  instanceCancelReasonOptions,
} from "@/felo/instances/enums/InstanceCancelReason";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { Instance } from "@/felo/instances/models/Instance";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { getInstances } from "@/felo/instances/services/getInstances";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { isInstanceOtherReason } from "@/felo/instances/utils/isInstanceOtherReason";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { getCosts } from "@/financial/costs/services/getCosts";
import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import { getInstanceInvoices } from "@/financial/invoices/services/getInstanceInvoices";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserNationalCode from "@/identity/users/utils/searchUserNationalCode";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { messages } from "@/messages";
import { formatString } from "@/utils/string/formatString";

import { InspectionInfoTable } from "../../components/InspectionInfoTable";
import {
  Assignees,
  assigneesTemplate,
  AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Partial<Assignees>>(),
	[ids.informationFormStatus]: z.string(),
	[ids.informationFormNote]: z.string(),
	[ids.inspectionInstanceId]: z.string(),
	[ids.inspectionCaseNo]: z.string(),
	[ids.hasAccountingElements]: z.boolean(),
	[ids.reason]: z.custom<InstanceCancelReason>(),
	[ids.description]: z.string(),
});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();
	const { task, hooks, dispatch } = useTaskContext();

	const { clearErrors, control, register, setError, setValue, watch } =
		useFormContext<FormData>();

	const { [ids.previousTask]: previousTask } = task.data;

	const {
		[ids.inspectionInstanceId]: inspectionInstanceId,
		[ids.inspectionCaseNo]: inspectionCaseNo,
		[ids.reason]: reason,
	} = watch();

	const btnRef = useRef<HTMLButtonElement>(null);

	const [instance, setInstance] = useState<Instance>();
	const [numOfInvoices, setNumOfInvoices] = useState<number>(-1);
	const [numOfCosts, setNumOfCosts] = useState<number>(-1);

	useEffect(() => {
		dispatch({
			type: "update",
			options: { submitBtn: !!inspectionInstanceId },
		});
	}, [inspectionInstanceId, dispatch]);

	useEffect(() => {
		register(ids.inspectionInstanceId, { required: true });
		register(ids.hasAccountingElements, {
			validate: (value) => typeof value !== "undefined",
		});
	}, [register]);

	useEffect(() => {
		(async () => {
			if (!inspectionInstanceId) {
				setInstance(undefined);
				setNumOfInvoices(-1);
				setNumOfCosts(-1);
				return;
			}

			try {
				const instance = await getInstanceById(inspectionInstanceId, [
					"InspectionMethod",
					"Assignees",
					"Buyer",
					"InvoicePaymentStatus",
				]);

				const problemInvoices = await getInstanceInvoices(instance.id, {
					filters: {
						$and: [
							{ status: { $ne: InvoiceStatus.Active } },
							{ status: { $ne: InvoiceStatus.Cancelled } },
						],
					},
				});

				const problemCosts = await getCosts({
					filters: { caseId: instance.id, status: { $ne: "unpaid" } },
				});

				const hasAccountingElements = Boolean(
					(instance.parameters?.["InvoicePaymentStatus"] &&
						instance.parameters?.["InvoicePaymentStatus"] !==
							InvoicePaymentStatus.Unpaid) ||
						problemInvoices.length !== 0 ||
						problemCosts.length !== 0,
				);
				setValue(ids.hasAccountingElements, hasAccountingElements);

				setInstance(instance);
				setNumOfInvoices(problemInvoices.length);
				setNumOfCosts(problemCosts.length);
			} catch (err) {
				console.error(err);
			}
		})();
	}, [inspectionInstanceId, setValue]);

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// check parallels
				const cancellationInstance = await getInstances({
					filters: [
						{
							name: "processDefinitionKey",
							value: "Inspection_Cancellation",
						},
						{
							name: `parameters.${ids.inspectionInstanceId}`,
							value: data[ids.inspectionInstanceId],
						},
					],
				}).then((instances) => instances.at(0));

				if (
					cancellationInstance &&
					cancellationInstance.id !== task.instanceId
				) {
					throw new Error(
						formatString(
							"شماره درخواست مورد نظر در درخواست {0} جهت لغو در دستور کار قرار گرفته است.",
							cancellationInstance.caseNo,
						),
					);
				}

				// check paid invoices
				const paidInvoices = await getInstanceInvoices(
					data[ids.inspectionInstanceId],
					{
						filters: {
							$or: [
								{ status: InvoiceStatus.PartiallyPaid },
								{ status: InvoiceStatus.Paid },
							],
						},
					},
				).then(parseInvoice);

				if (paidInvoices.length) {
					throw new Error(
						"لغو درخواست به دلیل وجود فاکتور پرداخت شده امکان پذیر نیست.",
					);
				}

				// initialize assignees
				if (!data[ids.assignees]) {
					data[ids.assignees] = {};
				}

				// set assignee:creator
				data[ids.assignees][AssigneeType.Creator] = {
					id: identity.id,
					name: identity.fullname,
				};

				// set assignee:manager
				const managerNationalCode = (() => {
					switch (instance?.processKey) {
						case "Inspection_Case_IC":
						case "Inspection_Case_LC":
						case "Inspection_Case_Bank_COI":
						case "Inspection_Case_SC":
							return "0011878223"; // Fatemeh Esfandiari
						case "Inspection_Case_COI":
							return "4610257211"; // Sharareh Ghanadian
					}
				})();

				const manager =
					managerNationalCode &&
					(await getUsers({
						filters: {
							...searchUserNationalCode(managerNationalCode),
						},
					}).then((users) => users.at(0)));

				if (!manager) {
					throw Error("مدیر مربوط به درخواست بازرسی مورد نظر یافت نشد.");
				}

				data[ids.assignees][AssigneeType.Manager] = {
					id: manager.id,
					name: manager.fullname,
				};

				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Creator,
					assigneeTitle: assigneesTemplate[AssigneeType.Creator],
					noteContent: "",
				};

				// set manual status
				data[ids.informationFormStatus] = "forward";
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// update watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set stage
				await setStageOfInstance(
					task.instanceId,
					"information-review-by-manager",
				);
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity, instance]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			{previousTask && (
				<>
					<PreviousTaskReferrer />
					<Separator className="col-span-full h-1" />
				</>
			)}

			<FormField
				control={control}
				name={ids.inspectionCaseNo}
				render={({ field: { onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>شماره درخواست:</FormLabel>
						<div className="flex gap-3">
							<FormControl>
								<Input
									disabled={!!inspectionInstanceId}
									onChange={(event) => {
										clearErrors(ids.inspectionCaseNo);
										onChange(event);
									}}
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											btnRef.current?.click();
										}
									}}
									{...field}
								/>
							</FormControl>
							{inspectionInstanceId ? (
								<Button
									className="px-4"
									size="lg"
									type="button"
									variant="ghost"
									onClick={() => {
										setValue(ids.inspectionCaseNo, "");
										setValue(ids.inspectionInstanceId, "");
									}}
								>
									<FaPencil />
									<span>تغییر</span>
								</Button>
							) : (
								<Button
									ref={btnRef}
									className="px-4"
									disabled={!inspectionCaseNo}
									size="lg"
									type="button"
									onClick={async () => {
										clearErrors(ids.inspectionCaseNo);
										try {
											const instance = await getInstances({
												filters: [
													{ name: "caseNo", value: inspectionCaseNo },
													{
														name: "processDefinitionKey",
														value: { $regex: `^Inspection_Case` },
													},
												],
											}).then((instances) => instances.at(0));

											if (!instance) {
												throw new Error("شماره درخواست مورد نظر یافت نشد.");
											}

											if (instance.status !== InstanceStatus.Completed) {
												throw new Error(
													"لغو درخواست تنها برای درخواست های بازرسی پایان یافته امکان پذیر است.",
												);
											}

											const paidInvoices = await getInstanceInvoices(
												instance.id,
												{
													filters: {
														$or: [
															{ status: InvoiceStatus.PartiallyPaid },
															{ status: InvoiceStatus.Paid },
														],
													},
												},
											).then(parseInvoice);

											if (paidInvoices.length) {
												throw new Error(
													"لغو درخواست به دلیل وجود فاکتور پرداخت شده امکان پذیر نیست.",
												);
											}

											const cancellationInstance = await getInstances({
												filters: [
													{
														name: "processDefinitionKey",
														value: "Inspection_Cancellation",
													},
													{
														name: `parameters.${ids.inspectionInstanceId}`,
														value: instance.id,
													},
												],
											}).then((instances) => instances.at(0));

											if (
												cancellationInstance &&
												cancellationInstance.id !== task.instanceId
											) {
												throw new Error(
													formatString(
														"شماره درخواست مورد نظر در درخواست {0} جهت لغو در دستور کار قرار گرفته است.",
														cancellationInstance.caseNo,
													),
												);
											}

											setValue(ids.inspectionInstanceId, instance.id);
										} catch (err: any) {
											console.error(err);
											setError(ids.inspectionCaseNo, {
												message: err.message || "خطای نامشخصی رخ داد.",
											});
										}
									}}
								>
									<FaMagnifyingGlass />
									<span>بررسی</span>
								</Button>
							)}
						</div>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: true }}
			/>

			<InspectionInfoTable
				instance={instance}
				numOfInvoices={numOfInvoices}
				numOfCosts={numOfCosts}
			/>

			{inspectionInstanceId && (
				<>
					{isFieldInTaskForm(task, ids.reason) && (
						<FormField
							control={control}
							name={ids.reason}
							render={({ field }) => (
								<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
									<FormLabel>علت لغو:</FormLabel>
									<FormControl>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{instanceCancelReasonOptions.map((x, index) => (
													<SelectItem key={index} value={x.value}>
														{x.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
							rules={{ required: messages.validation.required }}
						/>
					)}

					{isFieldInTaskForm(task, ids.description) &&
						reason &&
						isInstanceOtherReason(reason) && (
							<FormField
								control={control}
								name={ids.description}
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
										<FormLabel>توضیحات لغو:</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
								rules={{ required: messages.validation.required }}
								shouldUnregister
							/>
						)}

					<Separator className="col-span-full h-1" />

					<FormField
						control={control}
						name={ids.informationFormNote}
						render={({ field }) => (
							<FormItem className="col-span-full">
								<FormLabel>
									توضیحات{" "}
									{!isFieldInTaskForm(task, ids.reason) && "(علت لغو درخواست)"}:
								</FormLabel>
								<FormControl>
									<Textarea className="min-h-48" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
						rules={{
							required:
								!isFieldInTaskForm(task, ids.reason) &&
								messages.validation.required,
						}}
						shouldUnregister
					/>
				</>
			)}
		</div>
	);
}

const PhaseEntry = { schema, render: <PhasePage /> };

export default PhaseEntry;
