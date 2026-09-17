"use client";

import moment from "jalali-moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaPlus, FaTrash, FaWandMagicSparkles } from "react-icons/fa6";
import { z } from "zod";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MaskInput } from "@/components/ui/mask-input";
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
import { getDocuments } from "@/felo/files/services/getDocuments";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskCancel } from "@/felo/tasks/hooks/useTaskCancel";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { isReopenedTask } from "@/felo/tasks/utils/isReopenedTask";
import { isLockedIncomeErrorMessage } from "@/financial/incomes/utils/isLockedIncomeErrorMessage";
import { InvoiceExpiryAt } from "@/financial/invoices/components/InvoiceExpiryAt";
import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import { invoiceType as invoiceTypeType } from "@/financial/invoices/enums/InvoiceType";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { getInvoices } from "@/financial/invoices/services/getInvoices";
import { lockInvoice } from "@/financial/invoices/services/lockInvoice";
import { payInvoices } from "@/financial/invoices/services/payInvoices";
import { unlockInvoices } from "@/financial/invoices/services/unlockInvoices";
import { getInvoiceNoSequence } from "@/financial/invoices/utils/getInvoiceNoSequence";
import { isLockedInvoiceErrorMessage } from "@/financial/invoices/utils/isLockedInvoiceErrorMessage";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { toCurrency } from "@/utils/String";

import { bankAccountOptions } from "../../data/bankAccounts";
import { foreignAccountOptions } from "../../data/foreignAccounts";
import { PaymentType, paymentTypeOptions } from "../../enums/PaymentType";
import {
	Assignees,
	assigneesTemplate,
	AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { InvoiceItem } from "../../models/InvoiceItem";
import { getLedgerAccountByCode } from "../../utils/getLedgerAccountByCode";
import { InvoiceAddDialog } from "./InvoiceAddDialog";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Assignees>(),
	[ids.informationFormStatus]: z.custom<ReviewStatus>(),
	[ids.informationFormNote]: z.string(),
	[ids.invoiceItems]: z.custom<InvoiceItem[]>(),
	[ids.paymentType]: z.custom<PaymentType>(),
	[ids.bankAccount]: z.string(),
	[ids.receiptNo]: z.string(),
	[ids.foreignAccount]: z.string(),
	[ids.paymentAmount]: z.string(),
	[ids.paymentDate]: z.string(),
	[ids.voucherNo]: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	const { openTaskCancelDialog } = useTaskCancel();

	const isTaskReopened = isReopenedTask(task);

	const { control, setValue, watch } = useFormContext<FormData>();

	const { [ids.previousTask]: previousTask } = task.data;

	const {
		[ids.assignees]: assignees,
		[ids.informationFormStatus]: reviewStatus,
		[ids.invoiceItems]: invoiceItems,
		[ids.paymentType]: paymentType,
	} = watch();

	const {} = assignees ?? {};

	const isPositiveStatus =
		typeof reviewStatus === "undefined" ||
		reviewStatus === ReviewStatus.Forward ||
		reviewStatus === ReviewStatus.AutoDocument;
	const isNegativeStatus = reviewStatus === ReviewStatus.Cancel;

	const [isLoadingInvoices, setIsLoadingInvoices] = useState<boolean>(true);
	const [invoices, setInvoices] = useState<Invoice[]>([]);

	const invoiceType = useMemo(() => invoices.at(0)?.type, [invoices]);
	const invoiceRecipient = useMemo(() => invoices.at(0)?.recipient, [invoices]);
	const recipientId = invoiceRecipient
		? (invoiceRecipient.refId ?? null)
		: undefined;
	const invoicesTotal = useMemo(
		() =>
			invoices.map((x) => x.total + x.tax).reduce((acc, curr) => acc + curr, 0),
		[invoices],
	);

	const [invoiceAddDialog, setInvoiceAddDialog] = useState<boolean>(false);

	const handleInvoiceAddDialogOpen = useCallback(() => {
		setInvoiceAddDialog(true);
	}, []);

	const handleInvoiceAddDialogClose = useCallback(
		(invoice?: Invoice) => {
			setInvoiceAddDialog(false);
			if (invoice) {
				const nextValues: InvoiceItem[] = [
					...invoiceItems,
					{
						id: invoice.id,
						invoiceNo: invoice.invoiceNo,
						issueNo: invoice.issueNo ?? undefined,
						caseNos:
							Array.from(
								new Set(invoice.items?.map((x) => x.caseNo).filter(Boolean)),
							) ?? [],
					},
				];
				setValue(ids.invoiceItems, nextValues, { shouldValidate: true });
			}
		},
		[invoiceItems, setValue],
	);

	function handleInvoiceRemove(invoiceId: string) {
		const nextValues: InvoiceItem[] = [
			...invoiceItems.filter((x) => x.id !== invoiceId),
		];
		setValue(ids.invoiceItems, nextValues, { shouldValidate: true });
	}

	useEffect(() => {
		if (typeof invoiceItems === "undefined") {
			setValue(ids.invoiceItems, []);
		}
	}, [invoiceItems, setValue]);

	useEffect(() => {
		(async () => {
			try {
				if (!invoiceItems?.length) {
					setInvoices([]);
					return;
				}

				setIsLoadingInvoices(true);

				const invoices = await getInvoices({
					filters: { _id: [...new Set(invoiceItems.map((x) => x.id))] },
					populate: ["items", "issuedBy"],
				});
				setInvoices(parseInvoice(invoices));
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoadingInvoices(false);
			}
		})();
	}, [invoiceItems]);

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// initialize assignees
				if (!data[ids.assignees]) {
					data[ids.assignees] = {};
				}

				// set assignee:expert
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
					// verify foreign account payment type availability
					if (
						data[ids.paymentType] === PaymentType.ForeignAccount &&
						!isFieldInTaskForm(task, ids.foreignAccount)
					) {
						throw new Error(
							"جهت ثبت درخواست با نوع پرداخت حساب ارزی، درخواست جدید ایجاد نمایید.",
						);
					}

					// verify receipt document
					const receipts = await getDocuments({
						instanceId: task.instanceId,
						types: ["receipt"],
					});

					if (!receipts.files.length) {
						throw new Error("بارگذاری رسید پرداخت در بخش مدارک الزامی است.");
					}

					// verify receipt no and bank
					if (data[ids.paymentType] === PaymentType.BankDeposit) {
						const instances = await getInstances({
							filters: [
								{ name: "_id", value: { $ne: task.instanceId } },
								{
									name: `parameters.${ids.bankAccount}`,
									value: data[ids.bankAccount],
								},
								{
									name: `parameters.${ids.receiptNo}`,
									value: data[ids.receiptNo],
								},
								{
									name: "status",
									value: { $ne: InstanceStatus.Canceled },
								},
							],
						});

						if (instances.length) {
							throw new Error("بانک و شماره واریزی وارد شده تکراری است.");
						}
					}

					// get invoices
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
							issueNo: inv.issueNo ?? undefined,
							caseNos:
								Array.from(
									new Set(inv.items!.map((x) => x.caseNo).filter(Boolean)),
								) ?? [],
						};
					});

					if (!isTaskReopened) {
						const invalidStatusInvoice = invoices.find(
							(x) =>
								x.status !== InvoiceStatus.Active &&
								x.status !== InvoiceStatus.Issued,
						);

						if (invalidStatusInvoice) {
							throw new Error(
								`فاکتور با شناسه ${invalidStatusInvoice.invoiceNo} در مرحله مجاز جهت ثبت وصول نیست.`,
							);
						}

						// TODO: batch lock invoice
						try {
							await Promise.all(invoices.map((x) => lockInvoice(x.id)));
						} catch (err) {
							if (isApiResponse(err)) {
								if (
									isLockedIncomeErrorMessage(err) ||
									isLockedInvoiceErrorMessage(err)
								) {
									throw new Error("امکان انجام این عملیات وجود ندارد.");
								}
							}

							throw err;
						}
					}
				} else if (
					data[ids.informationFormStatus] === ReviewStatus.AutoDocument
				) {
					// verify auto document review status availability
					if (!isFieldInTaskForm(task, ids.voucherNo)) {
						throw new Error(
							"جهت استفاده از قابلیت ثبت سند خودکار، درخواست جدید ایجاد نمایید.",
						);
					}

					// verify payment type
					if (data[ids.paymentType] !== PaymentType.BankDeposit) {
						throw new Error(
							"امکان ثبت سند خودکار فقط برای نوع پرداخت واریز بانکی امکان پذیر است.",
						);
					}

					// verify receipt document
					const receipts = await getDocuments({
						instanceId: task.instanceId,
						types: ["receipt"],
					});

					if (!receipts.files.length) {
						throw new Error("بارگذاری رسید پرداخت در بخش مدارک الزامی است.");
					}

					// verify receipt no and bank
					if (data[ids.paymentType] === PaymentType.BankDeposit) {
						const instances = await getInstances({
							filters: [
								{ name: `_id`, value: { $ne: task.instanceId } },
								{
									name: `parameters.${ids.bankAccount}`,
									value: data[ids.bankAccount],
								},
								{
									name: `parameters.${ids.receiptNo}`,
									value: data[ids.receiptNo],
								},
								{
									name: "status",
									value: { $ne: InstanceStatus.Canceled },
								},
							],
						});

						if (instances.length) {
							throw new Error("بانک و شماره واریزی وارد شده تکراری است.");
						}
					}

					// get invoices
					const invoiceIds = data[ids.invoiceItems].map(
						(x: InvoiceItem) => x.id,
					);

					const invoices = await getInvoices({
						filters: {
							_id: invoiceIds,
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
							issueNo: inv.issueNo ?? undefined,
							caseNos:
								Array.from(
									new Set(inv.items!.map((x) => x.caseNo).filter(Boolean)),
								) ?? [],
						};
					});

					// auto create financial document
					try {
						const invoiceDate = moment(
							data[ids.paymentDate],
							"jYYYY/jMM/jDD",
						).format("YYYY/MM/DD");

						const ledgerAccount = getLedgerAccountByCode(
							data[ids.paymentType] === PaymentType.BankDeposit
								? data[ids.bankAccount]
								: data[ids.foreignAccount],
						);

						const voucherNo = await payInvoices({
							ids: invoiceIds,
							date: invoiceDate,
							slCode: ledgerAccount.slCode,
							dlCode: ledgerAccount.dlCode,
							receiptNo: data[ids.receiptNo],
						});

						data[ids.voucherNo] = voucherNo.toString();
					} catch (err: any) {
						let errorMessage: string | undefined;
						if (isApiResponse(err)) {
							if (err.message === "Recipient information is not completed") {
								errorMessage =
									"صدور فاکتور به دلیل ناقص بودن اطلاعات گیرنده فاکتور امکان پذیر نیست.";
							}
						}

						throw new Error(
							errorMessage || "خطای نامشخصی در هنگام ثبت سند خودکار رخ داد.",
						);
					}
				} else if (data[ids.informationFormStatus] === ReviewStatus.Cancel) {
					await openTaskCancelDialog();

					if (data[ids.invoiceItems]?.length) {
						try {
							await unlockInvoices(data[ids.invoiceItems].map((x) => x.id));
						} catch (err) {
							if (isApiResponse(err)) {
								if (
									isLockedIncomeErrorMessage(err) ||
									isLockedInvoiceErrorMessage(err)
								) {
									throw new Error("امکان انجام این عملیات وجود ندارد.");
								}
							}

							throw err;
						}
					}
				}
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// add creator to watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set next stage based on status
				const nextStage =
					data[ids.informationFormStatus] === ReviewStatus.Cancel
						? "cancelled"
						: "information-review";
				await setStageOfInstance(task.instanceId, nextStage);
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity, isTaskReopened, openTaskCancelDialog]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			{previousTask && (
				<>
					<PreviousTaskReferrer />
					<Separator className="col-span-full h-1" />
				</>
			)}

			{invoiceType && (
				<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>
						نوع فاکتور<span className="text-red-600"> *</span>
					</FormLabel>
					<FormControl>
						<Input disabled value={invoiceTypeType[invoiceType].title} />
					</FormControl>
				</FormItem>
			)}

			{invoiceRecipient && (
				<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>
						گیرنده فاکتور<span className="text-red-600"> *</span>
					</FormLabel>
					<FormControl>
						<Input
							disabled
							value={`${invoiceRecipient.name} ${invoiceRecipient.lastname ?? ""}`.trim()}
						/>
					</FormControl>
				</FormItem>
			)}

			<FormField
				control={control}
				name={ids.invoiceItems}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 space-y-3 xl:col-span-10 2xl:col-span-8">
						<Card>
							<CardHeader orientation="horizontal">
								<CardTitle>فاکتورها</CardTitle>
								{!isTaskReopened && recipientId !== null && (
									<CardNav>
										<Button
											ref={field.ref}
											disabled={isLoadingInvoices}
											type="button"
											variant="default"
											onClick={handleInvoiceAddDialogOpen}
										>
											<FaPlus />
											افزودن فاکتور
										</Button>

										<InvoiceAddDialog
											payload={{ invoiceType, invoiceRecipient }}
											open={invoiceAddDialog}
											onClose={handleInvoiceAddDialogClose}
										/>
									</CardNav>
								)}
							</CardHeader>
							<CardContent className="space-y-6 px-0">
								<Table
									loading={isLoadingInvoices}
									slotProps={{ root: { className: "rounded-none border-x-0" } }}
								>
									<TableHeader>
										<TableRow className="whitespace-nowrap">
											<TableHead className="w-16">#</TableHead>
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
										{invoices.length ? (
											invoices.map((invoice, index) => (
												<TableRow
													key={invoice.id}
													className="whitespace-nowrap"
												>
													<TableCell>{index + 1}</TableCell>
													<TableCell>
														{getInvoiceNoSequence(invoice.invoiceNo)}
													</TableCell>
													<TableCell>
														{Array.from(
															new Set(invoice.items?.map((x) => x.caseNo)) ??
																[],
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
																		شماره فاکتور سپیدار:
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
																	<TableAction>
																		<Tooltip>
																			<TooltipTrigger asChild>
																				<Button
																					className="size-full focus-within:text-red-600 hover:text-red-600 active:text-red-600"
																					size="icon"
																					type="button"
																					variant="link"
																					onClick={() =>
																						handleInvoiceRemove(invoice.id)
																					}
																				>
																					<FaTrash />
																				</Button>
																			</TooltipTrigger>
																			<TooltipContent>
																				حذف فاکتور
																			</TooltipContent>
																		</Tooltip>
																	</TableAction>
																</TableActions>
															</TooltipProvider>
														</TableCell>
													)}
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>

								<div className="px-6">
									<div className="flex gap-3">
										<span className="text-muted-foreground">مبلغ مجموع:</span>
										<div>
											{isLoadingInvoices ? (
												<Loading size="xs" />
											) : invoicesTotal ? (
												<>
													<span className="tracking-wide" dir="ltr">
														{toCurrency(invoicesTotal.toString())}
													</span>{" "}
													ریال
												</>
											) : (
												"-"
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					validate: (value) => {
						if (isPositiveStatus && !value.length) {
							return "افزودن حداقل یک مورد فاکتور الزامی است.";
						}
					},
				}}
			/>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.paymentType}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							نوع پرداخت<span className="text-red-600"> *</span>
						</FormLabel>
						<FormControl>
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{paymentTypeOptions.map((x) => (
										<SelectItem
											key={x.value}
											value={x.value}
											visible={x.visible}
										>
											{x.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			{paymentType === PaymentType.BankDeposit && (
				<>
					<FormField
						control={control}
						name={ids.bankAccount}
						render={({ field }) => (
							<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
								<FormLabel>
									حساب بانکی<span className="text-red-600"> *</span>
								</FormLabel>
								<FormControl>
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											{/* <SelectValue /> */}
											<span className="truncate" dir="rtl">
												{field.value ? (
													bankAccountOptions.find(
														(x) => x.value === field.value,
													)?.label
												) : (
													<>&nbsp;</>
												)}
											</span>
										</SelectTrigger>
										<SelectContent>
											{bankAccountOptions.map((x) => (
												<SelectItem
													key={x.value}
													value={x.value}
													visible={x.visible}
												>
													<div className="space-y-1">
														<div>{x.label}</div>
														{x.description && (
															<div className="text-xs text-muted-foreground">
																{x.description}
															</div>
														)}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
						rules={{
							required: isPositiveStatus && messages.validation.required,
						}}
						shouldUnregister
					/>

					<FormField
						control={control}
						name={ids.receiptNo}
						render={({ field }) => (
							<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
								<FormLabel>
									شماره رسید واریزی<span className="text-red-600"> *</span>
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
						rules={{
							required: isPositiveStatus && messages.validation.required,
						}}
						shouldUnregister
					/>
				</>
			)}

			{paymentType === PaymentType.ForeignAccount && (
				<FormField
					control={control}
					name={ids.foreignAccount}
					render={({ field }) => (
						<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
							<FormLabel>
								حساب ارزی<span className="text-red-600"> *</span>
							</FormLabel>
							<FormControl>
								<Select value={field.value} onValueChange={field.onChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{foreignAccountOptions.map((x) => (
											<SelectItem
												key={x.value}
												value={x.value}
												visible={x.visible}
											>
												{x.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
					rules={{
						required: isPositiveStatus && messages.validation.required,
					}}
					shouldUnregister
				/>
			)}

			<FormField
				control={control}
				name={ids.paymentAmount}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							مبلغ پرداختی<span className="text-red-600"> *</span>
						</FormLabel>
						<div className="relative">
							<FormControl>
								<MaskInput
									className="ps-10 rtl:text-right"
									dir="ltr"
									inputRef={ref}
									mask={Number}
									scale={0}
									thousandsSeparator=","
									unmask
									onAccept={onChange}
									{...field}
								/>
							</FormControl>
							<Button
								className="absolute bottom-0 end-3.5 top-0 w-3.5 text-muted-foreground focus-within:text-blue-600 hover:text-blue-600 active:text-blue-600"
								type="button"
								variant="link"
								onClick={() => {
									setValue(ids.paymentAmount, invoicesTotal.toString());
								}}
							>
								<FaWandMagicSparkles />
							</Button>
						</div>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			<FormField
				control={control}
				name={ids.paymentDate}
				render={({ field }) => (
					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							تاریخ پرداخت<span className="text-red-600"> *</span>
						</FormLabel>
						<FormControl>
							<DateInput {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: isPositiveStatus && messages.validation.required }}
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
							<FormLabel>توضیحات</FormLabel>
							<FormControl>
								<Textarea className="min-h-48" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
					rules={{}}
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
