"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { AlertDescription } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { currency as currencyType, Currency } from "@/enums/Currency";
import {
	CostMethod,
	costMethodOptions,
} from "@/financial/costs/enums/CostMethod";
import { CostPeriod } from "@/financial/costs/enums/CostPeriod";
import {
	CostPersonType,
	costPersonTypeOptions,
} from "@/financial/costs/enums/CostPersonType";
import { CostService, costService } from "@/financial/costs/enums/CostService";
import { CostServiceAccessType } from "@/financial/costs/enums/CostServiceAccessType";
import { CostType, costTypeOptions } from "@/financial/costs/enums/CostType";
import { Cost } from "@/financial/costs/models/Cost";
import { createCost } from "@/financial/costs/services/createCost";
import { updateCost } from "@/financial/costs/services/updateCost";
import { getCurrencyRate } from "@/financial/currency-rate/services/getCurrencyRate";
import { FinancialCategoryType } from "@/financial/financial-category/enums/FinancialCategoryType";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { PaymentRule } from "@/financial/payment-rules/models/PaymentRule";
import { getPaymentRulesByUser } from "@/financial/payment-rules/services/getPaymentRulesByUser";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { UserType } from "@/identity/users/models/UserType";
import { currencies } from "@/inspection/models/Currencies";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z
	.object({
		categoryId: z.string().min(1, messages.validation.required),
		personType: z.custom<CostPersonType>(Boolean, messages.validation.required),
		person: z.custom<UserLookup>().nullable(),
		personName: z.string(),
		rule: z.custom<PaymentRule>().nullable(),
		type: z.custom<CostType>(Boolean, messages.validation.required),
		method: z.custom<CostMethod>(Boolean, messages.validation.required),
		amount: z.string().min(1, messages.validation.required),
		currency: z.custom<Currency>(),
		currencyRate: z.string(),
		description: z.string({ required_error: messages.validation.required }),
	})
	.refine(({ type, currency }) => type === CostType.Percentage || currency, {
		path: ["currency"],
		message: messages.validation.required,
	})
	.refine(
		({ type, currencyRate }) => type === CostType.Percentage || currencyRate,
		{
			path: ["currencyRate"],
			message: messages.validation.required,
		},
	);

type FormData = z.infer<typeof schema>;

function CostUpsertForm({
	cost,
	instanceId,
	caseNo,
	onClose,
}: {
	cost: Cost | null;
	instanceId: string;
	caseNo: string;
	onClose: (result?: boolean) => void;
}) {
	const { identity } = useLoggedInUser();

	const isConfidentialUser = useMemo<boolean>(
		() => identity.type === UserType.System || identity.groups.includes("ceo"),
		[identity],
	);

	const [categories, setCategories] = useState<FinancialCategory[]>([]);

	const form = useForm<FormData>({
		defaultValues: {
			categoryId: cost?.categoryId ?? undefined,
			personType: cost
				? cost.personId
					? CostPersonType.User
					: CostPersonType.Other
				: undefined,
			person: cost?.personId
				? {
						id: cost.personId,
						name: cost.personName!,
					}
				: undefined,
			personName: cost?.personName ?? "",
			rule: cost?.rule ?? undefined,
			type: cost?.type ?? undefined,
			method: cost?.method ?? undefined,
			amount: cost?.amount ?? "",
			currency: cost?.currency ?? undefined,
			currencyRate: cost?.currencyRate?.toString() ?? "",
			description: cost?.description ?? "",
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

	const { categoryId, personType, person, rule, type, currency } = watch();

	const [isLoadingRules, setIsLoadingRules] = useState<boolean>(!!cost?.person);
	const [rules, setRules] = useState<PaymentRule[]>([]);

	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleSubmit(values: FormData) {
		try {
			const category = categories.find((x) => x.id === values.categoryId)!;

			if (cost) {
				await updateCost(cost.id, {
					personId: values.person?.id ?? null,
					personName: values.person?.name ?? (values.personName || null),
					ruleId: values.rule?.id ?? null,
					type: values.type,
					method: values.method,
					amount: values.amount,
					currency: values.currency || Currency.Rial,
					currencyRate: Number(values.currencyRate) || 1,
					description: values.description,
				});

				toast.success(
					<span>
						هزینه{" "}
						<span className="text-xs font-semibold">«{category.title}»</span> با
						موفقیت بروزرسانی شد.
					</span>,
				);
			} else {
				await createCost({
					caseId: instanceId,
					caseNo,
					categoryId: values.categoryId,
					title: category.title,
					personId: values.person?.id ?? null,
					personName: values.person?.name ?? (values.personName || null),
					ruleId: values.rule?.id ?? null,
					type: values.type,
					method: values.method,
					amount: values.amount,
					currency: values.currency || Currency.Rial,
					currencyRate: Number(values.currencyRate) || 1,
					description: values.description,
					period: CostPeriod.Any,
				});

				toast.success(
					<span>
						هزینه{" "}
						<span className="text-xs font-semibold">«{category.title}»</span> با
						موفقیت ایجاد شد.
					</span>,
				);
			}

			onClose(true);
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: err?.message || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	useEffect(() => {
		(async () => {
			try {
				const categories = await getFinancialCategories({
					filters: { type: FinancialCategoryType.Cost },
				});

				setCategories(
					isConfidentialUser
						? categories
						: categories.filter(
								(x) =>
									!x.key ||
									costService[x.key as CostService].accessType ===
										CostServiceAccessType.Open,
							),
				);
			} catch (err) {
				console.error(err);
			}
		})();
	}, [isConfidentialUser]);

	useEffect(() => {
		(async () => {
			setRules([]);

			if (!person) {
				return;
			}

			try {
				setIsLoadingRules(true);

				const rules = await getPaymentRulesByUser(person.id);
				setRules(rules);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoadingRules(false);
			}
		})();
	}, [person]);

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
				<DialogTitle>{cost ? "ویرایش هزینه" : "ایجاد هزینه"}</DialogTitle>
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
												disabled={!!cost}
												value={field.value ?? ""}
												onValueChange={(value) => {
													field.onChange(value);

													// reset other fields
													resetField("personType", {
														defaultValue: undefined,
													});
													resetField("person", {
														defaultValue: undefined,
													});
													resetField("personName", {
														defaultValue: "",
													});
													resetField("rule", {
														defaultValue: undefined,
													});
													resetField("method", {
														defaultValue: undefined,
													});
													resetField("type", {
														defaultValue: undefined,
													});
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
										name="personType"
										render={({ field }) => (
											<FormItem className="col-span-full !col-start-1 sm:col-span-6">
												<FormLabel>نوع ذینفع:</FormLabel>
												<FormControl>
													<Select
														value={field.value ?? ""}
														onValueChange={(value) => {
															field.onChange(value);

															// reset other fields
															resetField("person", {
																defaultValue: undefined,
															});
															resetField("personName", {
																defaultValue: "",
															});
															resetField("rule", {
																defaultValue: undefined,
															});
															resetField("method", {
																defaultValue: undefined,
															});
															resetField("type", {
																defaultValue: undefined,
															});
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
														}}
													>
														<SelectTrigger ref={field.ref}>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{costPersonTypeOptions.map((x) => (
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

									{personType === CostPersonType.User && (
										<FormField
											control={control}
											name="person"
											render={({ field }) => (
												<FormItem className="col-span-full col-start-1 sm:col-span-6">
													<FormLabel>ذینفع:</FormLabel>
													<FormControl>
														<UserLookupSelect
															value={field.value}
															onValueChange={(value) => {
																field.onChange(value);

																// reset other fields
																resetField("rule", {
																	defaultValue: undefined,
																});
																resetField("method", {
																	defaultValue: undefined,
																});
																resetField("type", {
																	defaultValue: undefined,
																});
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
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									{personType === CostPersonType.Other && (
										<FormField
											control={control}
											name="personName"
											render={({ field }) => (
												<FormItem className="col-span-full col-start-1 sm:col-span-6">
													<FormLabel>ذینفع:</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									{(personType === CostPersonType.Other || person) && (
										<>
											<Separator className="col-span-full" />

											{person && (
												<FormField
													control={control}
													name="rule"
													render={({ field }) => (
														<FormItem className="col-span-full !col-start-1 sm:col-span-6">
															<FormLabel>قانون پرداخت:</FormLabel>
															<FormControl>
																<Select
																	value={field.value?.id ?? ""}
																	onValueChange={(value) => {
																		if (value === "clear") {
																			field.onChange(null);

																			// reset other fields
																			resetField("method", {
																				defaultValue: undefined,
																			});
																			resetField("type", {
																				defaultValue: undefined,
																			});
																			resetField("amount", {
																				defaultValue: "",
																			});
																			resetField("currency", {
																				defaultValue: undefined,
																			});
																			resetField("currencyRate", {
																				defaultValue: "",
																			});
																		}

																		const rule = rules.find(
																			(x) => x.id === value,
																		);

																		if (rule) {
																			field.onChange(rule);

																			setValue(
																				"method",
																				rule.method as unknown as CostMethod,
																			);
																			setValue(
																				"type",
																				rule.type as unknown as CostType,
																			);
																			setValue(
																				"amount",
																				rule.amount.toString(),
																			);
																			setValue("currency", Currency.Rial);
																			setValue("currencyRate", "1");
																		}
																	}}
																>
																	<SelectTrigger ref={field.ref}>
																		<SelectValue />
																	</SelectTrigger>
																	<SelectContent>
																		{field.value && (
																			<SelectItem value="clear">-</SelectItem>
																		)}
																		{rules.map((x) => (
																			<SelectItem key={x.id} value={x.id}>
																				{x.name}
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
												name="method"
												render={({ field }) => (
													<FormItem className="col-span-full !col-start-1 sm:col-span-6">
														<FormLabel>نحوه محاسبه:</FormLabel>
														<FormControl>
															<Select
																disabled={!!rule}
																value={field.value ?? ""}
																onValueChange={(value) => {
																	field.onChange(value);
																}}
															>
																<SelectTrigger ref={field.ref}>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	{costMethodOptions.map((x) => (
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
												name="type"
												render={({ field }) => (
													<FormItem className="col-span-full col-start-1 sm:col-span-6">
														<FormLabel>نوع پرداخت:</FormLabel>
														<FormControl>
															<Select
																disabled={!!rule}
																value={field.value ?? ""}
																onValueChange={(value) => {
																	field.onChange(value);

																	// reset other fields
																	resetField("amount", {
																		defaultValue: "",
																	});
																	resetField("currency", {
																		defaultValue: undefined,
																	});
																	resetField("currencyRate", {
																		defaultValue: "",
																	});
																}}
															>
																<SelectTrigger ref={field.ref}>
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	{costTypeOptions.map((x) => (
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

											<Separator className="col-span-full" />

											<FormField
												control={control}
												name="amount"
												render={({ field: { ref, onChange, ...field } }) => (
													<FormItem className="col-span-full !col-start-1 sm:col-span-6">
														<FormLabel>
															مقدار{type === CostType.Percentage && " (درصد)"}:
														</FormLabel>
														<FormControl>
															<MaskInput
																className="rtl:text-right"
																dir="ltr"
																disabled={!!rule}
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

											{type && type === CostType.Fixed && (
												<>
													<FormField
														control={control}
														name="currency"
														render={({ field }) => (
															<FormItem className="col-span-full !col-start-1 sm:col-span-6">
																<FormLabel>نوع ارز:</FormLabel>
																<FormControl>
																	<Select
																		disabled={!!rule}
																		value={field.value ?? ""}
																		onValueChange={(value) => {
																			field.onChange(value);

																			// set or reset other fields
																			if (value === Currency.Rial) {
																				setValue("currencyRate", "1");
																			} else {
																				resetField("currencyRate", {
																					defaultValue: "",
																				});
																			}
																		}}
																	>
																		<SelectTrigger ref={field.ref}>
																			<SelectValue />
																		</SelectTrigger>
																		<SelectContent>
																			{currencies.map((x) => (
																				<SelectItem
																					key={x.value}
																					value={x.value}
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
													/>

													{currency && currency !== Currency.Rial && (
														<FormField
															control={control}
															name="currencyRate"
															render={({
																field: { ref, onChange, ...field },
															}) => (
																<>
																	<FormItem className="col-span-full col-start-1 sm:col-span-6">
																		<FormLabel>نرخ ارز (ریال):</FormLabel>
																		<div className="relative">
																			<FormControl>
																				<MaskInput
																					className="rtl:text-right"
																					dir="ltr"
																					disabled={!!rule || isPending}
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

																										const rate =
																											await getCurrencyRate(
																												currencyType[currency]
																													.code!,
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
																								<Spinner
																									loading={isPending}
																									size="xs"
																								>
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
												</>
											)}

											<Separator className="col-span-full" />

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

						<div className="flex flex-col gap-3 xs:flex-row-reverse">
							<Button className="xs:min-w-24" variant="primary">
								<Spinner color="white" loading={isSubmitting} size="sm">
									{cost ? "بروزرسانی" : "افزودن"}
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

export { CostUpsertForm };
