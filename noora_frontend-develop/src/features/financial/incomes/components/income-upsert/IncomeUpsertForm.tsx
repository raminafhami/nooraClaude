"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTriangleExclamation, FaWandMagicSparkles } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { MaskInput } from "@/components/ui/mask-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { currency as currencyType, Currency } from "@/enums/Currency";
import { getCurrencyRate } from "@/financial/currency-rate/services/getCurrencyRate";
import { FinancialCategoryType } from "@/financial/financial-category/enums/FinancialCategoryType";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import {
	IncomeUnit,
	incomeUnitOptions,
} from "@/financial/incomes/enums/IncomeUnit";
import { Income } from "@/financial/incomes/models/Income";
import { createIncome } from "@/financial/incomes/services/createIncome";
import { updateIncome } from "@/financial/incomes/services/updateIncome";
import { isLockedInvoiceErrorMessage } from "@/financial/invoices/utils/isLockedInvoiceErrorMessage";
import { currencies } from "@/inspection/models/Currencies";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

import { forceUpdateIncome } from "../../services/forceUpdateIncome";
import { isLockedIncomeErrorMessage } from "../../utils/isLockedIncomeErrorMessage";

const schema = z.object({
	categoryId: z.string().min(1, messages.validation.required),
	amount: z.string().min(1, messages.validation.required),
	currency: z.custom<Currency>(Boolean, messages.validation.required),
	currencyRate: z.string().min(1, messages.validation.required),
	description: z.string({ required_error: messages.validation.required }),
	quantity: z.string().min(1, messages.validation.required),
	unit: z.custom<IncomeUnit>(Boolean, messages.validation.required),
	discount: z.string().min(1, messages.validation.required),
	hasTax: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

function IncomeUpsertForm({
	income,
	instanceId,
	force = false,
	onClose,
}: {
	income?: Income | null | undefined;
	instanceId?: string;
	force?: boolean;
	onClose: (result?: boolean) => void;
}) {
	const [categories, setCategories] = useState<FinancialCategory[]>([]);
	const form = useForm<FormData>({
		defaultValues: {
			categoryId: income?.categoryId ?? undefined,
			amount: income?.amount.toString() ?? "",
			currency: income?.currency ?? undefined,
			currencyRate: income?.currencyRate?.toString() ?? "",
			description: income?.description ?? "",
			quantity: income?.quantity.toString() ?? (instanceId ? "1" : ""),
			unit: income?.unit ?? (instanceId ? IncomeUnit.Pieces : undefined),
			discount: income?.discount.toString() ?? (instanceId ? "0" : "0"),
			hasTax: !instanceId ? !!income?.tax : undefined,
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		resetField,
		setError,
		setValue,
		watch,
	} = form;

	const { categoryId, currency } = watch();

	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleSubmit(values: FormData) {
		try {
			const category = categories.find((x) => x.id === values.categoryId)!;

			if (income?.id) {
				if (force) {
					await forceUpdateIncome(income.id, {
						categoryId: values.categoryId,
						title: category.title,
						amount: Number(values.amount),
						currency: values.currency,
						currencyRate: Number(values.currencyRate),
						description: values.description,
						quantity: Number(values.quantity),
						unit: values.unit,
					});
				} else {
					await updateIncome(income.id, {
						amount: Number(values.amount),
						currency: values.currency,
						currencyRate: Number(values.currencyRate),
						description: values.description,
						quantity: Number(values.quantity),
						unit: values.unit,
						discount: Number(values.discount),
					});
				}

				toast.success(
					<span>
						درآمد{" "}
						<span className="text-xs font-semibold">«{category.title}»</span> با
						موفقیت بروزرسانی شد.
					</span>,
				);
			} else {
				await createIncome({
					instanceId,
					categoryId: values.categoryId,
					title: category.title,
					amount: Number(values.amount),
					currency: values.currency,
					currencyRate: Number(values.currencyRate),
					description: values.description,
					quantity: Number(values.quantity),
					unit: values.unit,
					discount: Number(values.discount),
					hasTax: values.hasTax,
				});

				toast.success(
					<span>
						درآمد{" "}
						<span className="text-xs font-semibold">«{category.title}»</span> با
						موفقیت ایجاد شد.
					</span>,
				);
			}

			onClose(true);
		} catch (err: any) {
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
				message:
					errorMessage ||
					err?.message ||
					"خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	useEffect(() => {
		(async () => {
			try {
				const categories = await getFinancialCategories({
					filters: { type: FinancialCategoryType.Income },
				});
				setCategories(categories);
			} catch (err) {
				console.error(err);
			}
		})();
	}, []);

	return (
		<DialogContent
			className="max-w-screen-md"
			onInteractOutside={(event) => {
				if (isDirty) {
					event.preventDefault();
				}
			}}
		>
			<DialogHeader>
				<DialogTitle>{income?.id ? "ویرایش درآمد" : "ایجاد درآمد"}</DialogTitle>
			</DialogHeader>

			<Form {...form}>
				<form
					onSubmit={async (e) => {
						e.stopPropagation();
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
								name="categoryId"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6">
										<FormLabel>عنوان:</FormLabel>
										<FormControl>
											<Select
												disabled={!force && !!income?.id}
												value={field.value ?? ""}
												onValueChange={(value) => {
													field.onChange(value);

													// reset other fields
													if (!force && !income?.id) {
														resetField("amount", {
															defaultValue: "",
														});
														resetField("currency", {
															defaultValue: undefined,
														});
														resetField("currencyRate", {
															defaultValue: "",
														});
														resetField("description", {
															defaultValue: "",
														});

														resetField("quantity", {
															defaultValue:
																instanceId || income?.instanceId ? "1" : "",
														});

														resetField("unit", {
															defaultValue:
																instanceId || income?.instanceId
																	? IncomeUnit.Pieces
																	: undefined,
														});

														resetField("discount", {
															defaultValue:
																instanceId || income?.instanceId ? "0" : "",
														});
													}
												}}
											>
												<SelectTrigger ref={field.ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{categories.map((x) => (
														<SelectItem key={x.id} value={x.id}>
															{x.title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{categoryId && (
								<>
									<Separator className="col-span-full" />

									<FormField
										control={control}
										name="amount"
										render={({ field: { ref, onChange, ...field } }) => (
											<FormItem className="col-span-full !col-start-1 sm:col-span-6">
												<FormLabel>مبلغ:</FormLabel>
												<FormControl>
													<MaskInput
														className="rtl:text-right"
														dir="ltr"
														inputRef={ref}
														mapToRadix={["."]}
														mask={Number}
														radix="."
														scale={2}
														thousandsSeparator=","
														unmask
														onAccept={onChange}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name="currency"
										render={({ field }) => (
											<FormItem className="col-span-full !col-start-1 sm:col-span-6">
												<FormLabel>نوع ارز:</FormLabel>
												<FormControl>
													<Select
														value={field.value ?? ""}
														onValueChange={(value) => {
															field.onChange(value);

															// set or reset other fields
															if (value === Currency.Rial) {
																setValue("currencyRate", "1");
															} else {
																setValue("currencyRate", "");
															}
														}}
													>
														<SelectTrigger ref={field.ref}>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{currencies.map((x) => (
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

									{currency && currency !== Currency.Rial && (
										<FormField
											control={control}
											name="currencyRate"
											render={({ field: { ref, onChange, ...field } }) => (
												<>
													<FormItem className="col-span-full col-start-1 sm:col-span-6">
														<FormLabel>نرخ ارز (ریال):</FormLabel>
														<div className="relative">
															<FormControl>
																<MaskInput
																	className="ps-10 rtl:text-right"
																	dir="ltr"
																	disabled={isPending}
																	inputRef={ref}
																	mask={Number}
																	scale={0}
																	thousandsSeparator=","
																	unmask
																	onAccept={onChange}
																	{...field}
																/>
															</FormControl>

															{currencyType[currency].code && (
																<TooltipProvider>
																	<Tooltip>
																		<TooltipTrigger asChild>
																			<Button
																				className="absolute bottom-0 end-3.5 top-0 w-3.5 text-muted-foreground focus-within:text-blue-600 hover:text-blue-600 active:text-blue-600"
																				disabled={isPending}
																				type="button"
																				variant="link"
																				onClick={async () => {
																					try {
																						setIsPending(true);

																						const rate = await getCurrencyRate(
																							currencyType[currency].code!,
																						);

																						onChange(rate);
																					} catch (err) {
																						console.error(err);
																						toast.error(
																							"خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
																						);
																					} finally {
																						setIsPending(false);
																					}
																				}}
																			>
																				<Spinner loading={isPending} size="xs">
																					<FaWandMagicSparkles />
																				</Spinner>
																			</Button>
																		</TooltipTrigger>
																		<TooltipContent>
																			درج خودکار نرخ ارز
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>
															)}
														</div>
														<FormMessage />
													</FormItem>
												</>
											)}
										/>
									)}

									{!instanceId && !income?.instanceId && (
										<FormField
											control={control}
											name="hasTax"
											render={({ field: { value, onChange, ...field } }) => (
												<FormItem className="col-span-full">
													<div className="flex items-center gap-2">
														<FormControl>
															<Switch
																checked={!!value}
																disabled={!!income?.id}
																size="sm"
																onCheckedChange={(checked) => onChange(checked)}
																{...field}
															/>
														</FormControl>
														<FormLabel>دارای مالیات</FormLabel>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									<Separator className="col-span-full" />

									{!instanceId && !income?.instanceId && (
										<>
											<FormField
												control={control}
												name="quantity"
												render={({ field: { ref, onChange, ...field } }) => (
													<FormItem className="col-span-full !col-start-1 sm:col-span-6">
														<FormLabel>تعداد:</FormLabel>
														<FormControl>
															<MaskInput
																className="rtl:text-right"
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
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={control}
												name="unit"
												render={({ field }) => (
													<FormItem className="col-span-full col-start-1 sm:col-span-6">
														<FormLabel>واحد:</FormLabel>
														<FormControl>
															<Select
																value={field.value ?? ""}
																onValueChange={field.onChange}
															>
																<SelectTrigger ref={field.ref}>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	{incomeUnitOptions.map((x) => (
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

											{/* <FormField
												control={control}
												name="discount"
												render={({ field: { ref, onChange, ...field } }) => (
													<FormItem className="col-span-full !col-start-1 sm:col-span-6">
														<FormLabel>تخفیف:</FormLabel>
														<FormControl>
															<MaskInput
																className="rtl:text-right"
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
														<FormMessage />
													</FormItem>
												)}
											/> */}

											<Separator className="col-span-full" />
										</>
									)}

									<FormField
										control={control}
										name="description"
										render={({ field }) => (
											<FormItem className="col-span-full">
												<FormLabel>توضیحات:</FormLabel>
												<FormControl>
													<Textarea {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</>
							)}
						</div>

						{errors.root?.server && (
							<DestructiveAlert>
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						{force && (
							<Alert variant="warn">
								<FaTriangleExclamation />
								<AlertDescription>
									تغییر درآمد باعث تغییر ذینفع های پرداخت شده می شود.
								</AlertDescription>
							</Alert>
						)}

						<div className="flex flex-col gap-3 xs:flex-row-reverse">
							<Button className="xs:min-w-24" variant="primary">
								<Spinner color="white" loading={isSubmitting} size="sm">
									{income?.id ? "بروزرسانی" : "افزودن"}
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
	);
}

export { IncomeUpsertForm };
