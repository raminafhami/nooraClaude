"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import { z } from "zod";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	Form,
	FormControl,
	FormDescription,
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
import { Spinner } from "@/components/ui/spinner";
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
import { incomeUnit } from "@/financial/incomes/enums/IncomeUnit";
import { Income } from "@/financial/incomes/models/Income";
import { isLockedIncomeErrorMessage } from "@/financial/incomes/utils/isLockedIncomeErrorMessage";
import { messages } from "@/messages";
import { toCurrency } from "@/utils/String";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	InvoiceRecipientType,
	invoiceRecipientTypeOptions,
} from "../../enums/InvoiceRecipientType";
import { InvoiceServiceType } from "../../enums/InvoiceServiceType";
import { InvoiceType, invoiceTypeOptions } from "../../enums/InvoiceType";
import { Invoice } from "../../models/Invoice";
import { createInvoice } from "../../services/createInvoice";
import { updateInvoice } from "../../services/updateInvoice";
import { isLockedInvoiceErrorMessage } from "../../utils/isLockedInvoiceErrorMessage";
import { InvoiceCreateInspectionIncomeDialog } from "./InvoiceCreateInspectionIncomeDialog";
import { InvoiceCreateStandardIncomeDialog } from "./InvoiceCreateStandardIncomeDialog";

const formSchema = z.object({
	type: z.custom<InvoiceType>(),
	title: z.string(),
	recipient: z.object({
		refId: z.string().optional(),
		name: z.string().min(1, messages.validation.required),
		lastname: z.string(),
		type: z.custom<InvoiceRecipientType>().optional(),
		nationalCode: z.string(),
		economicCode: z.string(),
		registrationNo: z.string(),
		postalCode: z.string(),
		phone: z.string(),
		fax: z.string(),
		address: z.string(),
	}),
	incomes: z
		.custom<Income[]>()
		.refine((value) => value.length, "افزودن حداقل یک ردیف درآمد الزامی است."),
	description: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

function InvoiceUpsertDialog({
	payload,
	open,
	onClose,
}: {
	payload: Partial<{ invoice: Invoice; serviceType: InvoiceServiceType }>;
	open: boolean;
	onClose: (result?: boolean) => void;
}) {
	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	if (
		typeof payload.serviceType === "undefined" &&
		(typeof payload.invoice === "undefined" ||
			typeof payload.invoice.items?.at(0) !== "object")
	) {
		throw new Error("both invoice and serviceType cannot be undefined.");
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<Conditional mount={open} delay>
				<InvoiceUpsertForm
					invoice={payload.invoice}
					serviceType={
						payload.serviceType ||
						(payload.invoice!.items![0].instanceId
							? InvoiceServiceType.Inspection
							: InvoiceServiceType.Standard)
					}
					onClose={onClose}
				/>
			</Conditional>
		</Dialog>
	);
}

function InvoiceUpsertForm({
	invoice,
	serviceType,
	onClose,
}: {
	invoice?: Invoice;
	serviceType: InvoiceServiceType;
	onClose: (result?: boolean) => void;
}) {
	const dialogs = useDialogs();

	const form = useForm<FormSchema>({
		defaultValues: {
			type: invoice?.type ?? undefined,
			title: invoice?.title ?? "صورت حساب فروش کالا و خدمات",
			recipient: {
				refId: invoice?.recipient.refId ?? undefined,
				name: invoice?.recipient.name ?? "",
				lastname: invoice?.recipient.lastname ?? "",
				type: invoice?.recipient.type ?? undefined,
				nationalCode: invoice?.recipient.nationalCode ?? "",
				economicCode: invoice?.recipient.economicCode ?? "",
				registrationNo: invoice?.recipient.registrationNo ?? "",
				postalCode: invoice?.recipient.postalCode ?? "",
				phone: invoice?.recipient.phone ?? "",
				fax: invoice?.recipient.fax ?? "",
				address: invoice?.recipient.address ?? "",
			},
			incomes: invoice?.items ?? [],
			description: invoice?.description ?? "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		setError,
		setValue,
		watch,
	} = form;

	const { type, recipient, incomes } = watch();

	const incomesTotal = incomes.reduce((acc, curr) => (acc += curr.total), 0);
	const tax = incomes.reduce((acc, curr) => (acc += curr.tax), 0);
	const total = incomesTotal + tax;

	async function handleSubmit(values: FormSchema) {
		try {
			if (invoice?.id) {
				await updateInvoice(invoice.id, {
					description: values.description,
				});
			} else {
				await createInvoice({
					type:
						serviceType === InvoiceServiceType.Standard
							? values.type
							: undefined,
					title: values.title,
					recipient: values.recipient,
					incomeIds: values.incomes.map((x) => x.id),
					description: values.description,
				});
			}

			onClose(true);
		} catch (err) {
			console.error(err);

			let errorMessage: string | undefined;
			if (isApiResponse(err)) {
				if (
					isLockedIncomeErrorMessage(err) ||
					isLockedInvoiceErrorMessage(err)
				) {
					errorMessage = "امکان انجام این عملیات وجود ندارد.";
				}
			}

			setError("root.server", {
				message: errorMessage || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	// dialogs
	const handleStandardIncomeDialogOpen = useCallback(async () => {
		const result = await dialogs.open(InvoiceCreateStandardIncomeDialog);

		if (result) {
			setValue("incomes", [
				...incomes,
				...result.incomes.filter((x) => !incomes.some((y) => x.id === y.id)),
			]);
		}
	}, [dialogs, incomes, setValue]);

	const handleInspectionIncomeDialogOpen = useCallback(async () => {
		const result = await dialogs.open(InvoiceCreateInspectionIncomeDialog, {
			type,
			recipient,
		});

		if (result) {
			if (!type) {
				setValue("type", result.type);
			}

			if (!recipient.refId) {
				setValue("recipient", {
					refId: result.recipient.refId,
					name: result.recipient.name,
					lastname: result.recipient.lastname ?? "",
					type: undefined,
					nationalCode: result.recipient.nationalCode ?? "",
					economicCode: result.recipient.economicCode ?? "",
					registrationNo: result.recipient.registrationNo ?? "",
					postalCode: result.recipient.postalCode ?? "",
					phone: result.recipient.phone ?? "",
					fax: result.recipient.fax ?? "",
					address: result.recipient.address ?? "",
				});
			}

			setValue("incomes", [
				...incomes,
				...result.incomes.filter((x) => !incomes.some((y) => x.id === y.id)),
			]);
		}
	}, [dialogs, type, recipient, incomes, setValue]);

	return (
		<>
			<DialogContent
				className="max-w-screen-lg"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>
						{invoice?.id ? "ویرایش فاکتور" : "افزودن فاکتور جدید"}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={async (event) => {
							event.stopPropagation();
							await form.handleSubmit(handleSubmit)(event);
						}}
					>
						<fieldset
							className="space-y-8"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<div className="grid grid-cols-12 gap-6">
								<FormField
									control={control}
									name="title"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormLabel>عنوان</FormLabel>
											<FormControl>
												<Input disabled {...field} />
											</FormControl>
											<FormDescription className="text-xs">
												این عنوان در خروجی فاکتور نمایش داده نخواهد شد.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="col-span-full flex items-center gap-3">
									<span>مشخصات گیرنده</span>
									<Separator className="h-1 w-auto grow rounded" />
								</div>

								{serviceType === InvoiceServiceType.Inspection && (
									<Alert className="col-span-full" variant="info">
										<FaTriangleExclamation />
										<AlertDescription>
											اطلاعات این بخش پس از مشخص شدن ردیف های فاکتور به طور
											خودکار پر می شوند.
										</AlertDescription>
									</Alert>
								)}

								<FormField
									control={control}
									name="recipient.name"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>
												نام
												<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="recipient.lastname"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>نام خانوادگی</FormLabel>
											<FormControl>
												<Input
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{serviceType === InvoiceServiceType.Standard && (
									<FormField
										control={control}
										name="recipient.type"
										render={({
											field: { ref, disabled, value, onChange, ...field },
										}) => (
											<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
												<FormLabel>نوع</FormLabel>
												<FormControl>
													<Select
														disabled={!!invoice?.id || disabled}
														value={value ?? ""}
														onValueChange={(value) =>
															onChange(value !== "clear" ? value : undefined)
														}
														{...field}
													>
														<SelectTrigger ref={ref}>
															<SelectValue placeholder="-" />
														</SelectTrigger>

														<SelectContent>
															{value && (
																<SelectItem value="clear">-</SelectItem>
															)}

															{invoiceRecipientTypeOptions.map((x) => (
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
									/>
								)}

								<FormField
									control={control}
									name="recipient.nationalCode"
									render={({ field }) => (
										<FormItem className="col-span-full !col-start-1 sm:col-span-6 md:col-span-4">
											<FormLabel>شناسه/شماره ملی</FormLabel>
											<FormControl>
												<Input
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="recipient.economicCode"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>شماره اقتصادی</FormLabel>
											<FormControl>
												<Input
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="recipient.registrationNo"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>شماره ثبت</FormLabel>
											<FormControl>
												<Input
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="recipient.postalCode"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>کد پستی</FormLabel>
											<FormControl>
												<Input
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="recipient.phone"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>تلفن</FormLabel>
											<FormControl>
												<Input
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="recipient.fax"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>فکس</FormLabel>
											<FormControl>
												<Input
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="recipient.address"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormLabel>آدرس</FormLabel>
											<FormControl>
												<Input
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection
													}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="col-span-full flex items-center gap-3">
									<span>مشخصات کالا یا خدمات مورد معامله</span>
									<Separator className="h-1 w-auto grow rounded" />
								</div>

								<div className="col-span-full flex flex-col xs:flex-row">
									<Button
										disabled={!!invoice?.id}
										type="button"
										variant="default"
										onClick={
											serviceType === InvoiceServiceType.Standard
												? handleStandardIncomeDialogOpen
												: handleInspectionIncomeDialogOpen
										}
									>
										افزودن درآمد&nbsp;
										{serviceType === InvoiceServiceType.Standard
											? "آزاد"
											: "درخواست های بازرسی"}
									</Button>
								</div>

								<FormField
									control={control}
									name="type"
									render={({
										field: { ref, disabled, value, onChange, ...field },
									}) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>
												نوع
												<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Select
													disabled={
														!!invoice?.id ||
														serviceType === InvoiceServiceType.Inspection ||
														disabled
													}
													value={value ?? ""}
													onValueChange={onChange}
													{...field}
												>
													<SelectTrigger ref={ref}>
														<SelectValue placeholder="-" />
													</SelectTrigger>

													<SelectContent>
														{invoiceTypeOptions.map((x) => (
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
								/>

								<FormField
									control={control}
									name="incomes"
									render={() => (
										<FormItem className="col-span-full">
											<div className="-mx-6">
												<Table
													slotProps={{
														root: { className: "rounded-none border-x-0" },
													}}
												>
													<TableHeader>
														<TableRow className="whitespace-nowrap">
															<TableHead className="w-12">#</TableHead>
															<TableHead className="w-20">
																شماره پرونده
															</TableHead>
															<TableHead>شرح کالا / خدمت</TableHead>
															<TableHead className="w-28">
																تعداد / مقدار
															</TableHead>
															<TableHead className="w-28">واحد</TableHead>
															<TableHead className="w-40">مبلغ واحد</TableHead>
															<TableHead className="w-40">مبلغ کل</TableHead>
															{!invoice?.id && (
																<TableHead className="w-24">عملیات</TableHead>
															)}
														</TableRow>
													</TableHeader>
													<TableBody>
														{incomes.length ? (
															incomes.map((income, index) => (
																<TableRow
																	key={income.id}
																	className="whitespace-nowrap"
																>
																	<TableCell>{index + 1}</TableCell>

																	<TableCell>{income.caseNo}</TableCell>

																	<TableCell>{income.title}</TableCell>

																	<TableCell>{income.quantity}</TableCell>

																	<TableCell>
																		{incomeUnit[income.unit]?.title}
																	</TableCell>

																	<TableCell>
																		{toCurrency(
																			(
																				income.amount * income.currencyRate
																			).toString(),
																		)}
																	</TableCell>

																	<TableCell>
																		{toCurrency(income.total.toString())}
																	</TableCell>

																	{!invoice?.id && (
																		<TableCell>
																			<TooltipProvider>
																				<TableActions>
																					<TableAction>
																						<Tooltip>
																							<TooltipTrigger asChild>
																								<Button
																									className="size-full focus-within:text-red-600 hover:text-red-600 active:text-red-600"
																									size="icon"
																									variant="link"
																									onClick={() => {
																										const nextIncomes =
																											incomes.filter(
																												(x) =>
																													x.id !== income.id,
																											);
																										setValue(
																											"incomes",
																											nextIncomes,
																										);

																										if (
																											serviceType ===
																												InvoiceServiceType.Inspection &&
																											!nextIncomes.length
																										) {
																											setValue(
																												"type",
																												undefined as unknown as any,
																											);
																											setValue("recipient", {
																												refId: undefined,
																												name: "",
																												lastname: "",
																												type: undefined,
																												nationalCode: "",
																												economicCode: "",
																												registrationNo: "",
																												postalCode: "",
																												phone: "",
																												fax: "",
																												address: "",
																											});
																										}
																									}}
																								>
																									<FaTrash />
																								</Button>
																							</TooltipTrigger>
																							<TooltipContent>
																								حذف درآمد
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
																<TableCell colSpan={100}>
																	هیچ موردی یافت نشد.
																</TableCell>
															</TableRow>
														)}
													</TableBody>
												</Table>
											</div>

											<FormMessage />
										</FormItem>
									)}
								/>

								<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
									<FormLabel>جمع کل</FormLabel>
									<FormControl>
										<Input
											disabled
											value={toCurrency(incomesTotal.toString())}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>

								<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
									<FormLabel>مالیات و عوارض</FormLabel>
									<FormControl>
										<Input disabled value={toCurrency(tax.toString())} />
									</FormControl>
									<FormMessage />
								</FormItem>

								<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
									<FormLabel>مبلغ قابل پرداخت</FormLabel>
									<FormControl>
										<Input disabled value={toCurrency(total.toString())} />
									</FormControl>
									<FormMessage />
								</FormItem>

								<div className="col-span-full">
									<Separator className="h-1 w-auto grow rounded" />
								</div>

								<FormField
									control={control}
									name="description"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormLabel>توضیحات</FormLabel>
											<FormControl>
												<Textarea {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{errors.root?.server && (
								<DestructiveAlert>
									<AlertDescription>
										{errors.root.server.message}
									</AlertDescription>
								</DestructiveAlert>
							)}

							<DialogFooter>
								<Button className="min-w-24" variant="primary">
									<Spinner color="white" loading={isSubmitting} size="xs">
										{invoice?.id ? "بروزرسانی" : "افزودن"}
									</Spinner>
								</Button>

								<Button type="button" variant="ghost" onClick={() => onClose()}>
									بازگشت
								</Button>
							</DialogFooter>
						</fieldset>
					</form>
				</Form>
			</DialogContent>
		</>
	);
}

export { InvoiceUpsertDialog };
