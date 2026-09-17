"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
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
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { zodResolver } from "@hookform/resolvers/zod";

import { bankAccounts } from "../../flows/invoice-payment/data/bankAccounts";
import { foreignAccountOptions } from "../../flows/invoice-payment/data/foreignAccounts";
import {
	paymentType as paymentTypeType,
	PaymentType,
	paymentTypeOptions,
} from "../../flows/invoice-payment/enums/PaymentType";
import {
	InvoicePaymentFilterArgs,
	InvoicePaymentVoucherEntryBy,
} from "./InvoicePaymentList.types";

const bankAccountOptions = bankAccounts.map((x) => ({
	value: `${x.slCode}::${x.dlCode}`,
	label: x.title,
	slCode: x.slCode,
	dlCode: x.dlCode,
}));

const voucherEntryByOptions = [
	{ value: "creator", label: "اتوماتیک" },
	{ value: "accountant", label: "حسابداری" },
] as const;

const formSchema = z.object({
	creator: z.custom<UserLookup>().optional(),
	paymentType: z.custom<PaymentType>().optional(),
	bankAccount: z.string().optional(),
	receiptNo: z.string(),
	foreignAccount: z.string().optional(),
	paymentDateFrom: z.string(),
	paymentDateTo: z.string(),
	caseNo: z.string(),
	voucherNo: z.string(),
	voucherEntryBy: z.custom<InvoicePaymentVoucherEntryBy>().optional(),
	dateFrom: z.string(),
	dateTo: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

function InvoicePaymentFilterDialog({
	payload: filterArgs,
	open,
	onClose,
}: DialogProps<InvoicePaymentFilterArgs, InvoicePaymentFilterArgs>) {
	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<FormSchema>({
		defaultValues: {
			creator: filterArgs.creator || undefined,
			paymentType: filterArgs.paymentType || undefined,
			bankAccount: filterArgs.bankAccount || undefined,
			receiptNo: filterArgs.receiptNo || "",
			foreignAccount: filterArgs.foreignAccount || undefined,
			paymentDateFrom: filterArgs.paymentDateFrom || "",
			paymentDateTo: filterArgs.paymentDateTo || "",
			caseNo: filterArgs.caseNo || "",
			voucherNo: filterArgs.voucherNo || "",
			voucherEntryBy: filterArgs.voucherEntryBy || undefined,
			dateFrom: filterArgs.dateFrom || "",
			dateTo: filterArgs.dateTo || "",
		},
		resolver: zodResolver(formSchema),
	});

	const { control, watch } = form;

	const { paymentType } = watch();

	function handleSubmit(values: FormSchema) {
		onClose({ ...values });
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-sm">
				<DialogHeader>
					<DialogTitle>جستجو در فهرست پرداختی فاکتورها</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						ref={formRef}
						className="space-y-8"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<fieldset className="grid grid-cols-12 gap-6">
							<FormField
								control={control}
								name="creator"
								render={({ field: { onChange, ...field } }) => (
									<FormItem className="col-span-full xs:col-span-6">
										<FormLabel>درخواست دهنده</FormLabel>
										<FormControl>
											<UserLookupSelect
												{...field}
												onValueChange={(value) => onChange(value ?? undefined)}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="caseNo"
								render={({ field }) => (
									<FormItem className="col-span-full xs:col-span-6">
										<FormLabel>شماره درخواست بازرسی</FormLabel>
										<FormControl>
											<Input
												className="tracking-wider rtl:text-right"
												dir="ltr"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="paymentType"
								render={({ field }) => (
									<FormItem className="col-span-full xs:col-span-6">
										<FormLabel>نحوه پرداخت</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? ""}
												onValueChange={(value) => {
													field.onChange(value !== "clear" ? value : undefined);
												}}
											>
												<SelectTrigger>
													<span className="truncate" dir="rtl">
														{field.value ? (
															paymentTypeType[field.value as PaymentType].title
														) : (
															<>-</>
														)}
													</span>
												</SelectTrigger>

												<SelectContent>
													{field.value && (
														<SelectItem value="clear">-</SelectItem>
													)}

													{paymentTypeOptions.map((x) => (
														<SelectItem key={x.value} value={x.value}>
															{x.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
									</FormItem>
								)}
							/>

							{paymentType === PaymentType.BankDeposit && (
								<FormField
									control={control}
									name="bankAccount"
									render={({ field }) => (
										<FormItem className="col-span-full xs:col-span-6">
											<FormLabel>حساب بانکی</FormLabel>
											<FormControl>
												<Select
													value={field.value ?? ""}
													onValueChange={(value) => {
														field.onChange(
															value !== "clear" ? value : undefined,
														);
													}}
												>
													<SelectTrigger>
														<span className="truncate" dir="rtl">
															{field.value ? (
																bankAccountOptions.find(
																	(x) => x.value === field.value,
																)?.label
															) : (
																<>-</>
															)}
														</span>
													</SelectTrigger>

													<SelectContent>
														{field.value && (
															<SelectItem value="clear">-</SelectItem>
														)}

														{bankAccountOptions.map((x) => (
															<SelectItem key={x.value} value={x.value}>
																<div className="space-y-1">
																	<div>{x.label}</div>
																	<div className="text-xs text-muted-foreground">
																		معین: {x.slCode}، تفصیلی: {x.dlCode}
																	</div>
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
									shouldUnregister
								/>
							)}

							{paymentType === PaymentType.BankDeposit && (
								<FormField
									control={control}
									name="receiptNo"
									render={({ field }) => (
										<FormItem className="col-span-full xs:col-span-6">
											<FormLabel>شماره پیگیری</FormLabel>
											<FormControl>
												<Input
													className="tracking-wider rtl:text-right"
													dir="ltr"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
									shouldUnregister
								/>
							)}

							{paymentType === PaymentType.ForeignAccount && (
								<FormField
									control={control}
									name="foreignAccount"
									render={({ field }) => (
										<FormItem className="col-span-full xs:col-span-6">
											<FormLabel>حساب ارزی</FormLabel>
											<FormControl>
												<Select
													value={field.value ?? ""}
													onValueChange={(value) => {
														field.onChange(
															value !== "clear" ? value : undefined,
														);
													}}
												>
													<SelectTrigger>
														<SelectValue placeholder="-" />
													</SelectTrigger>

													<SelectContent>
														{field.value && (
															<SelectItem value="clear">-</SelectItem>
														)}

														{foreignAccountOptions.map((x) => (
															<SelectItem key={x.value} value={x.value}>
																{x.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
									shouldUnregister
								/>
							)}

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="paymentDateFrom"
								render={({ field }) => (
									<FormItem className="col-span-full xs:col-span-6">
										<FormLabel>تاریخ پرداخت از</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="paymentDateTo"
								render={({ field }) => (
									<FormItem className="col-span-full xs:col-span-6">
										<FormLabel>تاریخ پرداخت تا</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="voucherNo"
								render={({ field }) => (
									<FormItem className="col-span-full xs:col-span-6">
										<FormLabel>شماره سند حسابداری</FormLabel>
										<FormControl>
											<Input
												className="tracking-wider rtl:text-right"
												dir="ltr"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="voucherEntryBy"
								render={({ field }) => (
									<FormItem className="col-span-full xs:col-span-6">
										<FormLabel>نحوه ثبت سند</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? ""}
												onValueChange={(value) => {
													field.onChange(value !== "clear" ? value : undefined);
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder="-" />
												</SelectTrigger>

												<SelectContent>
													{field.value && (
														<SelectItem value="clear">-</SelectItem>
													)}

													{voucherEntryByOptions.map((x) => (
														<SelectItem key={x.value} value={x.value}>
															{x.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="dateFrom"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 xs:col-span-6">
										<FormLabel>تاریخ ثبت سند از</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="dateTo"
								render={({ field }) => (
									<FormItem className="col-span-full xs:col-span-6">
										<FormLabel>تاریخ ثبت سند تا</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
						</fieldset>

						<DialogFooter>
							<Button className="min-w-24" type="submit" variant="primary">
								جستجو
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export { InvoicePaymentFilterDialog };
