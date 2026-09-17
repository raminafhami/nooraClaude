"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaPlus, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardNav,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableAction,
  TableActions,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskCancel } from "@/felo/tasks/hooks/useTaskCancel";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";
import { isReopenedTask } from "@/felo/tasks/utils/isReopenedTask";
import { InvoiceExpiryAt } from "@/financial/invoices/components/InvoiceExpiryAt";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { getInvoiceById } from "@/financial/invoices/services/getInvoiceById";
import { getInvoices } from "@/financial/invoices/services/getInvoices";
import { getInvoiceNoSequence } from "@/financial/invoices/utils/getInvoiceNoSequence";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { messages } from "@/messages";
import { toCurrency } from "@/utils/String";
import { formatString } from "@/utils/string/formatString";

import {
  Assignees,
  assigneesTemplate,
  AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { InvoiceItem } from "../../models/InvoiceItem";
import { InvoiceSelectDialog } from "./InvoiceSelectDialog";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Partial<Assignees>>(),
	[ids.informationFormStatus]: z.custom<ReviewStatus>(),
	[ids.informationFormNote]: z.string(),
	[ids.invoiceItems]: z.custom<InvoiceItem[]>(),
});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const { openTaskCancelDialog } = useTaskCancel();

	const isTaskReopened = isReopenedTask(task);

	const { control, setValue, watch } = useFormContext<FormData>();

	const { [ids.previousTask]: previousTask } = task.data;
	const {
		[ids.invoiceItems]: invoiceItems,
		[ids.informationFormStatus]: reviewStatus,
	} = watch();

	const isPositiveStatus =
		typeof reviewStatus === "undefined" ||
		reviewStatus === ReviewStatus.Forward;
	const isNegativeStatus = reviewStatus === ReviewStatus.Cancel;

	// invoice
	const invoiceItem = invoiceItems?.at(0);

	const [isLoadingInvoice, setIsLoadingInvoice] = useState<boolean>(true);
	const [invoice, setInvoice] = useState<Invoice>();

	useEffect(() => {
		(async () => {
			if (!invoiceItem) {
				setIsLoadingInvoice(false);
				setInvoice(undefined);
				return;
			}

			try {
				setIsLoadingInvoice(false);

				const invoice = await getInvoiceById(invoiceItem.id).then((invoice) =>
					parseInvoice(invoice),
				);

				setInvoice(invoice);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات فاکتور رخ داد.");
			} finally {
				setIsLoadingInvoice(false);
			}
		})();
	}, [invoiceItem, setValue]);

	// task submission hooks
	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				if (data[ids.informationFormStatus] === ReviewStatus.Forward) {
					// check parallels
					const cancellationInstance = await getInstances({
						filters: [
							{
								name: "processDefinitionKey",
								value: "Financial_Invoice_Cancellation",
							},
							{ name: "status", value: { $ne: InstanceStatus.Canceled } },
							{
								name: `parameters.${ids.invoiceItems}`,
								value: { $elemMatch: { id: data[ids.invoiceItems][0].id } },
							},
						],
					}).then((instances) => instances.at(0));

					if (
						cancellationInstance &&
						cancellationInstance.id !== task.instanceId
					) {
						throw new Error(
							formatString(
								"شماره فاکتور مورد نظر در درخواست {0} جهت لغو در دستور کار قرار گرفته است.",
								cancellationInstance.caseNo,
							),
						);
					}
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

				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Creator,
					assigneeTitle: assigneesTemplate[AssigneeType.Creator],
					noteContent: data[ids.informationFormNote],
				};

				if (data[ids.informationFormStatus] === ReviewStatus.Forward) {
					const invoices = await getInvoices({
						filters: {
							_id: data[ids.invoiceItems].map((x) => x.id),
						},
						populate: ["items"],
					}).then(parseInvoice);

					// rewrite invoiceItems for more stablity
					data[ids.invoiceItems] = data[ids.invoiceItems].map((invoice) => {
						const inv = invoices.find((x) => x.id === invoice.id);

						if (!inv) {
							throw new Error("invoice is not found.");
						}

						return {
							id: inv.id,
							invoiceNo: inv.invoiceNo,
							issueNo: inv.issueNo!,
							caseNos:
								Array.from(
									new Set(inv.items!.map((x) => x.caseNo).filter(Boolean)),
								) ?? [],
						};
					});
				} else if (data[ids.informationFormStatus] === ReviewStatus.Cancel) {
					await openTaskCancelDialog();
				}
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
					data[ids.informationFormStatus] === ReviewStatus.Cancel
						? "canceled"
						: "information-review-by-accountant",
				);
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity, openTaskCancelDialog]);

	const [selectOpen, setSelectOpen] = useState<boolean>(false);

	const handleSelectDialogOpen = useCallback(() => {
		setSelectOpen(true);
	}, []);

	const handleSelectDialogClose = useCallback(
		(result?: Invoice) => {
			setSelectOpen(false);

			if (result) {
				setValue(
					"InvoiceItems",
					[
						{
							id: result.id,
							invoiceNo: result.invoiceNo,
							issueNo: result.issueNo!,
							caseNos:
								Array.from(
									new Set(result.items?.map((x) => x.caseNo).filter(Boolean)),
								) ?? [],
						},
					],
					{ shouldValidate: true },
				);
			}
		},
		[setValue],
	);

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
				name={ids.invoiceItems}
				render={() => (
					<FormItem className="col-span-full !col-start-1 xl:col-span-10 2xl:col-span-8">
						<Card>
							<CardHeader orientation="horizontal">
								<CardTitle>فاکتور</CardTitle>
								{!isTaskReopened && !invoice && (
									<CardNav>
										<Button
											disabled={isLoadingInvoice}
											type="button"
											variant="default"
											onClick={handleSelectDialogOpen}
										>
											<FaPlus />
											افزودن فاکتور
										</Button>

										<InvoiceSelectDialog
											open={selectOpen}
											onClose={handleSelectDialogClose}
										/>
									</CardNav>
								)}
							</CardHeader>
							<CardContent className="px-0">
								<Table
									loading={isLoadingInvoice}
									slotProps={{
										root: { className: "rounded-none border-x-0" },
									}}
								>
									<TableHeader>
										<TableRow className="whitespace-nowrap">
											<TableHead className="w-24">شناسه فاکتور</TableHead>
											<TableHead className="w-24">شماره درخواست (ها)</TableHead>
											<TableHead className="w-40">جمع کل</TableHead>
											<TableHead className="w-40">مالیات و عوارض</TableHead>
											<TableHead className="w-40">مبلغ قابل پرداخت</TableHead>
											<TableHead className="w-52">وضعیت صدور</TableHead>
											<TableHead className="w-40">تاریخ انقضا</TableHead>
											{!isTaskReopened && (
												<TableHead className="w-36">عملیات</TableHead>
											)}
										</TableRow>
									</TableHeader>
									<TableBody>
										{invoice ? (
											<TableRow className="whitespace-nowrap">
												<TableCell>
													{getInvoiceNoSequence(invoice.invoiceNo)}
												</TableCell>
												<TableCell>
													{Array.from(
														new Set(invoice.items?.map((x) => x.caseNo)) ?? [],
													).join("، ") || "-"}
												</TableCell>
												<TableCell>
													<span className="tracking-wide" dir="ltr">
														{toCurrency(invoice.total.toString())}
													</span>
												</TableCell>
												<TableCell>
													<span className="tracking-wide" dir="ltr">
														{toCurrency(invoice.tax.toString())}
													</span>
												</TableCell>
												<TableCell>
													<span className="tracking-wide" dir="ltr">
														{toCurrency(
															(invoice.total + invoice.tax).toString(),
														)}
													</span>
												</TableCell>
												<TableCell>
													{invoice.issueNo ? (
														<div className="space-y-2 text-xs">
															{invoice.issuedBy && (
																<div>{invoice.issuedBy.name}</div>
															)}
															<div>
																<span className="tracking-wide text-muted-foreground">
																	شماره سپیدار:
																</span>{" "}
																{invoice.issueNo}
															</div>
															{invoice.issuedAt && (
																<div>
																	<span className="text-muted-foreground">
																		تاریخ:
																	</span>{" "}
																	{invoice.issuedAt.toLocaleDateString(
																		"fa-IR-u-nu-latn",
																		{
																			year: "numeric",
																			month: "2-digit",
																			day: "2-digit",
																		},
																	)}
																</div>
															)}
														</div>
													) : (
														"پیش فاکتور"
													)}
												</TableCell>
												<TableCell>
													<InvoiceExpiryAt date={invoice.expiryAt} />
												</TableCell>
												{!isTaskReopened && (
													<TableCell>
														<TooltipProvider>
															<TableActions>
																<Tooltip>
																	<TooltipTrigger>
																		<TableAction
																			className="focus-within:text-red-600 hover:text-red-600 active:text-red-600"
																			onClick={() =>
																				setValue(ids.invoiceItems, [])
																			}
																		>
																			<FaTrash />
																		</TableAction>
																	</TooltipTrigger>
																	<TooltipContent>حذف فاکتور</TooltipContent>
																</Tooltip>
															</TableActions>
														</TooltipProvider>
													</TableCell>
												)}
											</TableRow>
										) : (
											<TableRow>
												<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					validate: (value) => {
						if (isPositiveStatus && !value.length) {
							return "افزودن یک مورد فاکتور الزامی است.";
						}
					},
				}}
			/>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.informationFormStatus}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>وضعیت</FormLabel>
						<FormControl>
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{reviewStatusOptions.map((x) => (
										<SelectItem key={x.value} value={x.value}>
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

			{isPositiveStatus && (
				<FormField
					control={control}
					name={ids.informationFormNote}
					render={({ field }) => (
						<FormItem className="col-span-full">
							<FormLabel>
								توضیحات (علت لغو فاکتور ){" "}
								<span className="text-red-600">*</span>
							</FormLabel>
							<FormControl>
								<Textarea className="min-h-48" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
					rules={{ required: messages.validation.required }}
				/>
			)}
		</div>
	);
}

const PhaseEntry: TaskDetailsReturn<FormData> = {
	schema,
	render: <PhasePage />,
};

export default PhaseEntry;
