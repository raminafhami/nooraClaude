"use client";

import moment from "jalali-moment";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa6";
import { z } from "zod";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Conditional } from "@/components/ui/conditional";
import { DateInput } from "@/components/ui/date-input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { zeroDateTimeString } from "@/utils/date/zeroDateTimeString";
import { toCurrency } from "@/utils/String";
import { zodResolver } from "@hookform/resolvers/zod";

import { InvoiceServiceType } from "../../enums/InvoiceServiceType";
import { InvoiceType, invoiceTypeOptions } from "../../enums/InvoiceType";
import { Invoice } from "../../models/Invoice";
import { forceUpdateInvoice } from "../../services/forceUpdateInvoice";
import { isLockedInvoiceErrorMessage } from "../../utils/isLockedInvoiceErrorMessage";
import { InvoiceForceEditInspectionIncomeDialog } from "./InvoiceForceEditInspectionIncomeDialog";
import { InvoiceForceEditStandardIncomeDialog } from "./InvoiceForceEditStandardIncomeDialog";

function InvoiceForceEditDialog({
	payload,
	open,
	onClose,
}: {
	payload: { invoice?: Invoice };
	open: boolean;
	onClose: (result?: boolean) => void | undefined;
}) {
	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	if (
		typeof payload.invoice !== "undefined" &&
		typeof payload.invoice.items?.at(0) !== "object"
	) {
		throw new Error("invoice items must be populated and cannot be empty.");
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<Conditional mount={open} delay>
				<InvoiceForceEditForm
					invoice={payload.invoice!}
					serviceType={
						payload.invoice?.items![0].instanceId
							? InvoiceServiceType.Inspection
							: InvoiceServiceType.Standard
					}
					onClose={onClose}
				/>
			</Conditional>
		</Dialog>
	);
}

function InvoiceForceEditForm({
	invoice,
	serviceType,
	onClose,
}: {
	invoice: Invoice;
	serviceType: InvoiceServiceType;
	onClose: (result?: boolean) => void;
}) {
	const schema = z
		.object({
			type: z.custom<InvoiceType>(),
			title: z.string(),
			recipient: z.object({
				refId: z.string().optional(),
				name: z.string().min(1, messages.validation.required),
				lastname: z.string(),
				nationalCode: z.string(),
				economicCode: z.string(),
				registrationNo: z.string(),
				postalCode: z.string(),
				phone: z.string(),
				fax: z.string(),
				address: z.string(),
			}),
			issueNo: z.string().refine((value) => {
				if (invoice?.issueNo && !value) {
					return false;
				}

				return true;
			}, messages.validation.required),
			issuedAt: z.string(),
			financialDocumentId: z.string().refine((value) => {
				if (invoice?.financialDocumentId && !value) {
					return false;
				}

				return true;
			}, messages.validation.required),
			incomes: z
				.custom<Income[]>()
				.default([])
				.refine(
					(value) => value.length >= 1,
					"افزودن حداقل یک ردیف درآمد الزامی است.",
				),
			description: z.string(),
		})
		.refine(
			(data) => {
				if (data.issuedAt && !data.issueNo) {
					return false;
				}

				return true;
			},
			{
				message: messages.validation.required,
				path: ["issueNo"],
			},
		)
		.refine(
			(data) => {
				if (data.issueNo && !data.issuedAt) {
					return false;
				}

				return true;
			},
			{
				message: messages.validation.required,
				path: ["issuedAt"],
			},
		)
		.refine(
			(data) => {
				if (data.financialDocumentId && !data.issueNo) {
					return false;
				}

				return true;
			},
			{
				message: messages.validation.required,
				path: ["issueNo"],
			},
		);

	type FormSchema = z.infer<typeof schema>;

	const form = useForm<FormSchema>({
		defaultValues: {
			type: invoice.type,
			title: invoice.title,
			recipient: {
				refId: invoice.recipient.refId ?? undefined,
				name: invoice.recipient.name ?? "",
				lastname: invoice.recipient.lastname ?? "",
				nationalCode: invoice.recipient.nationalCode ?? "",
				economicCode: invoice.recipient.economicCode ?? "",
				registrationNo: invoice.recipient.registrationNo ?? "",
				postalCode: invoice.recipient.postalCode ?? "",
				phone: invoice.recipient.phone ?? "",
				fax: invoice.recipient.fax ?? "",
				address: invoice.recipient.address ?? "",
			},
			issueNo: invoice.issueNo ?? "",
			issuedAt: invoice.issuedAt
				? moment(invoice.issuedAt).format("jYYYY/jMM/jDD")
				: "",
			financialDocumentId: invoice.financialDocumentId ?? "",
			incomes: invoice.items,
			description: invoice.description ?? "",
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		setError,
		setValue,
		watch,
	} = form;

	const { incomes, issueNo, issuedAt, financialDocumentId } = watch();

	const incomesTotal = incomes.reduce((acc, curr) => (acc += curr.total), 0);
	const tax = incomes.reduce((acc, curr) => (acc += curr.tax), 0);
	const total = incomesTotal + tax;

	async function handleSubmit(values: FormSchema) {
		try {
			if (invoice?.id) {
				await forceUpdateInvoice(invoice.id, {
					description: values.description,
					title: values.title,
					financialDocumentId: values.financialDocumentId,
					items: values.incomes.map((x) => x.id),
					issueNo: values.issueNo,
					issuedAt: values.issuedAt
						? // ? zeroDateTimeString(moment(values.issuedAt, "jYYYY/jMM/jDD"))
							moment(values.issuedAt, "jYYYY/jMM/jDD").toISOString()
						: undefined,
					recipient: values.recipient,
				});
			}
			onClose(true);
		} catch (err: any) {
			console.error(err);

			let errorMessage: string | undefined;
			if (isApiResponse(err)) {
				if (err.message === "issueNo exists") {
					errorMessage = "شماره فاکتور سپیدار تکراری است.";
				} else if (err.message === "financialDocument exists") {
					errorMessage = "شماره سند حسابداری تکراری است.";
				} else if (
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

	// standard income dialog
	const [standardIncomeOpen, setStandardIncomeOpen] = useState<boolean>(false);

	const handleStandardIncomeDialogOpen = useCallback(() => {
		setStandardIncomeOpen(true);
	}, []);

	const handleStandardIncomeDialogClose = useCallback(
		(result?: { incomes: Income[] }) => {
			setStandardIncomeOpen(false);

			if (result) {
				setValue("incomes", [
					...incomes,
					...result.incomes.filter((x) => !incomes.some((y) => x.id === y.id)),
				]);
			}
		},
		[incomes, setValue],
	);

	// inspection income dialog
	const [inspectionIncomeOpen, setInspectionIncomeOpen] =
		useState<boolean>(false);

	const handleInspectionIncomeDialogOpen = useCallback(() => {
		setInspectionIncomeOpen(true);
	}, []);

	const handleInspectionIncomeDialogClose = useCallback(
		(result?: { incomes: Income[] }) => {
			setInspectionIncomeOpen(false);

			if (result) {
				setValue("incomes", [
					...incomes,
					...result.incomes.filter((x) => !incomes.some((y) => x.id === y.id)),
				]);
			}
		},
		[incomes, setValue],
	);

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
					<DialogTitle>ویرایش فاکتور</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							await handleRhfSubmit(handleSubmit)(e);
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
												<Input {...field} />
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

								<FormField
									control={control}
									name="recipient.name"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>
												نام
												<span className="text-red-600">*</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
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
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="recipient.nationalCode"
									render={({ field }) => (
										<FormItem className="col-span-full !col-start-1 sm:col-span-6 md:col-span-4">
											<FormLabel>شناسه/شماره ملی</FormLabel>
											<FormControl>
												<Input {...field} />
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
												<Input {...field} />
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
												<Input {...field} />
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
												<Input {...field} />
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
												<Input {...field} />
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
												<Input {...field} />
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
												<Input {...field} />
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
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>
												نوع
												<span className="text-red-600">*</span>
											</FormLabel>
											<FormControl>
												<Select
													disabled={true}
													value={field.value ?? ""}
													onValueChange={field.onChange}
												>
													<SelectTrigger>
														<SelectValue />
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
															<TableHead className="w-24">عملیات</TableHead>
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
																											(x) => x.id !== income.id,
																										);
																									setValue(
																										"incomes",
																										nextIncomes,
																									);
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
								<div className="col-span-full">
									<Separator className="h-1 w-auto grow rounded" />
								</div>
								<FormField
									control={control}
									name="issueNo"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>
												شماره فاکتور سپیدار
												{invoice?.issueNo ||
												invoice?.issuedAt ||
												invoice?.financialDocumentId ||
												issuedAt ||
												financialDocumentId ? (
													<span className="text-red-600">*</span>
												) : (
													<></>
												)}
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="issuedAt"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>
												تاریخ صدور فاکتور
												{(invoice?.issueNo ||
													invoice?.issuedAt ||
													invoice?.financialDocumentId ||
													issueNo ||
													financialDocumentId) && (
													<span className="text-red-600">*</span>
												)}
											</FormLabel>
											<FormControl>
												<DateInput {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="financialDocumentId"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>
												شماره سند
												{invoice?.financialDocumentId && (
													<span className="text-red-600">*</span>
												)}
											</FormLabel>
											<FormControl>
												<Input {...field} />
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

							<div className="flex flex-col gap-3 xs:flex-row-reverse">
								<Button className="xs:min-w-24" variant="primary">
									<Spinner color="white" loading={isSubmitting} size="xs">
										بروزرسانی
									</Spinner>
								</Button>

								<Button type="button" variant="ghost" onClick={() => onClose()}>
									بازگشت
								</Button>
							</div>
						</fieldset>
					</form>
				</Form>
			</DialogContent>

			<InvoiceForceEditStandardIncomeDialog
				open={standardIncomeOpen}
				onClose={handleStandardIncomeDialogClose}
			/>

			<InvoiceForceEditInspectionIncomeDialog
				open={inspectionIncomeOpen}
				onClose={handleInspectionIncomeDialogClose}
			/>
		</>
	);
}

export { InvoiceForceEditDialog };
