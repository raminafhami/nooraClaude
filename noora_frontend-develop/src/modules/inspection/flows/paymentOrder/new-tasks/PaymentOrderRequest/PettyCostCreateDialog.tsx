"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import FileDropzone from "@/components/ui/file-dropzone";
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
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Currency, currencyOptions } from "@/enums/Currency";
import { usePettyCategoryGroups } from "@/financial/petty-category/hooks/usePettyCategoryGroups";
import { PettyCostType } from "@/financial/petty-cost/enums/PettyCostType";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";
import { createPettyCost } from "@/financial/petty-cost/services/createPettyCost";
import uploadPettyCostFile from "@/financial/petty-cost/services/uploadPettyCostFile";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { verifyNationalOrLegalCode } from "@/utils/verifyNationalOrLegalCode";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
	.object({
		description: z.string().min(1, messages.validation.required),
		amount: z.string().min(1, messages.validation.required),
		currency: z.custom<Currency>(Boolean, messages.validation.required),
		currencyRate: z.string().min(1, messages.validation.required),
		hasVat: z.boolean(),
		invoiceNumber: z.string(),
		sellerNationalCode: z.string(),
		categoryId: z.string(),
	})
	.refine(({ hasVat, invoiceNumber }) => !hasVat || invoiceNumber, {
		path: ["invoiceNumber"],
		message: messages.validation.required,
	})
	.refine(
		({ amount, currency, currencyRate, sellerNationalCode }) =>
			(currency === Currency.Rial &&
				(parseFloat(amount) || 0) * (parseInt(currencyRate) || 0) <
					20_000_000) ||
			sellerNationalCode,
		{ path: ["sellerNationalCode"], message: messages.validation.required },
	)
	.refine(
		({ amount, currency, currencyRate, sellerNationalCode }) =>
			(currency === Currency.Rial &&
				(parseFloat(amount) || 0) * (parseInt(currencyRate) || 0) <
					20_000_000) ||
			verifyNationalOrLegalCode(sellerNationalCode),
		{
			path: ["sellerNationalCode"],
			message: "کد / شناسه ملی وارد شده نامعتبر است.",
		},
	);

type FormSchema = z.infer<typeof formSchema>;

const PettyCostCreateDialog = ({
	payload,
	open,
	onClose,
}: DialogProps<
	Partial<PettyCostApi> | undefined,
	PettyCostApi | undefined
>) => {
	const [attachments, setAttachments] = useState<File[]>([]);

	const form = useForm<FormSchema>({
		defaultValues: {
			description: "",
			amount: "",
			currency: payload?.currency || undefined,
			currencyRate: payload?.currency === Currency.Rial ? "1" : "",
			hasVat: false,
			invoiceNumber: "",
			sellerNationalCode: "",
			categoryId: "",
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

	const { amount, currency, currencyRate, hasVat } = watch();

	const total = useMemo<number>(
		() => (parseFloat(amount) || 0) * (parseInt(currencyRate) || 0),
		[amount, currencyRate],
	);

	async function handleSubmit(values: FormSchema) {
		try {
			const createdCost = await createPettyCost({
				type: PettyCostType.Unofficial,
				description: values.description,
				sellerNationalCode: values.sellerNationalCode,
				amount: parseFloat(values.amount),
				currency: values.currency,
				currencyRate: parseInt(values.currencyRate),
				hasVat: values.hasVat,
				invoiceNumber: values.invoiceNumber,
				categoryId: values.categoryId,
			});

			try {
				if (attachments.length) {
					await uploadPettyCostFile({
						attachments,
						costId: createdCost.id,
					});
				}
			} catch {}

			onClose(createdCost);
		} catch (err) {
			console.error(err);
			setError("root", { message: "خطای نامشخصی در هنگام ثبت هزینه رخ داد." });
		}
	}

	const { pettyCategoryGroups, isLoadingCategories } = usePettyCategoryGroups({
		onError: () => {
			toast.error("خطای نامشخصی در هنگام دریافت فهرست مراکز بودجه رخ داد.");
		},
	});

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				className="max-w-screen-xs"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
				aria-describedby={undefined}
			>
				<DialogHeader>
					<DialogTitle>افزودن هزینه جدید</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<Spinner loading={isLoadingCategories}>
						<form
							className="space-y-8"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<fieldset
								className="grid grid-cols-12 gap-6"
								disabled={isSubmitting || isSubmitSuccessful}
							>
								<FormField
									control={control}
									name="description"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormLabel>
												توضیحات<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator className="col-span-full h-0.5" />

								<FormField
									control={control}
									name="currency"
									render={({
										field: { ref, disabled, onChange, ...field },
									}) => (
										<FormItem
											className={cn(
												"col-span-full",
												currency &&
													currency !== Currency.Rial &&
													"xs:col-span-6",
											)}
										>
											<FormLabel>
												نوع ارز<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Select
													disabled={disabled || !!payload?.currency}
													onValueChange={(value) => {
														onChange(value);
														setValue(
															"currencyRate",
															value === Currency.Rial ? "1" : "",
														);
													}}
													{...field}
												>
													<SelectTrigger ref={ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{currencyOptions.map((currency) => (
															<SelectItem
																key={currency.value}
																value={currency.value}
															>
																{currency.label}
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
											<FormItem className="col-span-full xs:col-span-6">
												<FormLabel>
													نرخ ارز<span className="text-red-600"> *</span>
												</FormLabel>
												<FormControl>
													<MaskInput
														className="tracking-wider rtl:text-right"
														dir="ltr"
														inputRef={ref}
														mask={Number}
														scale={0}
														thousandsSeparator=","
														unmask
														onAccept={(value) => onChange(value)}
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								<FormField
									control={control}
									name="amount"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full">
											<FormLabel>
												مبلغ<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<MaskInput
													className="tracking-wider rtl:text-right"
													dir="ltr"
													inputRef={ref}
													mapToRadix={["."]}
													mask={Number}
													radix="."
													scale={2}
													thousandsSeparator=","
													unmask
													onAccept={(value) => onChange(value)}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								{currency && currency === Currency.Rial && (
									<FormField
										control={control}
										name="hasVat"
										render={({ field: { value, onChange, ...field } }) => (
											<FormItem className="col-span-full">
												<FormLabel className="flex gap-3">
													<FormControl>
														<Checkbox
															checked={value}
															onCheckedChange={(checked) => {
																onChange(!!checked);
															}}
															{...field}
														/>
													</FormControl>
													<span>با احتساب مالیات بر ارزش افزوده</span>
												</FormLabel>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								<Separator className="col-span-full h-0.5" />

								<FormField
									control={control}
									name="sellerNationalCode"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full">
											<FormLabel>
												کد / شناسه ملی فروشنده
												{((currency && currency !== Currency.Rial) ||
													total >= 20_000_000) && (
													<span className="text-red-600"> *</span>
												)}
											</FormLabel>
											<FormControl>
												<MaskInput
													className="tracking-wider rtl:text-right"
													dir="ltr"
													inputRef={ref}
													mask={/^\d+$/}
													maxLength={11}
													unmask
													onAccept={(value) => onChange(value)}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="invoiceNumber"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormLabel>
												شماره فاکتور
												{hasVat && <span className="text-red-600"> *</span>}
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator className="col-span-full h-0.5" />

								<FormField
									control={control}
									name="categoryId"
									render={({ field: { ref, value, onChange, ...field } }) => (
										<FormItem className="col-span-full">
											<FormLabel>مرکز هزینه</FormLabel>
											<FormControl>
												<Select
													value={value || "clear"}
													onValueChange={(value) =>
														onChange(value === "clear" ? "" : value)
													}
													{...field}
												>
													<SelectTrigger ref={ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{value && (
															<SelectItem value="clear">نامشخص</SelectItem>
														)}
														{pettyCategoryGroups?.map((group) => (
															<>
																<SelectGroup>
																	<SelectLabel>
																		{group.budgetCategory.title}
																	</SelectLabel>
																</SelectGroup>
																{group.costCategories.map((item) => (
																	<SelectItem key={item.id} value={item.id}>
																		{item.title}
																	</SelectItem>
																))}
															</>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormItem className="col-span-full">
									<FormLabel>پیوست ها</FormLabel>
									<FormControl>
										<FileDropzone onFilesAdded={setAttachments} />
									</FormControl>
									<FormMessage />
								</FormItem>
							</fieldset>

							{errors.root && (
								<DestructiveAlert>
									<AlertDescription>{errors.root.message}</AlertDescription>
								</DestructiveAlert>
							)}

							<div className="flex flex-col gap-3 xs:flex-row-reverse">
								<Button className="min-w-24" variant="primary">
									افزودن
								</Button>
							</div>
						</form>
					</Spinner>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export { PettyCostCreateDialog };
