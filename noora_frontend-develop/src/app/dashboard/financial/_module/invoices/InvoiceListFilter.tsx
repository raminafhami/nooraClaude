"use client";

import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  InvoiceStatus,
  invoiceStatusOptions,
} from "@/financial/invoices/enums/InvoiceStatus";
import {
  InvoiceType,
  invoiceTypeOptions,
} from "@/financial/invoices/enums/InvoiceType";
import { SelectItemType } from "@/types/SelectItem";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	invoiceNo: z.string(),
	issueNo: z.string(),
	recipient: z.string(),
	status: z.custom<InvoiceStatus>().nullable(),
	type: z.custom<InvoiceType>().nullable(),
});

type FormSchema = z.infer<typeof formSchema>;

const extendedInvoiceStatusOptions: SelectItemType[] = [
	{ value: "all", label: "همه وضعیت ها" },
	...invoiceStatusOptions,
];

const extendedInvoiceTypeOptions: SelectItemType[] = [
	{ value: "all", label: "همه" },
	...invoiceTypeOptions,
];
function InvoiceListFilter({
	queryFilters,
	setQueryFilters,
}: {
	queryFilters: {
		invoiceNo: string;
		issueNo: string;
		recipient: string;
		status: InvoiceStatus | null;
		type: InvoiceType | null;
	};
	setQueryFilters: Dispatch<
		SetStateAction<{
			invoiceNo: string;
			issueNo: string;
			recipient: string;
			status: InvoiceStatus | null;
			type: InvoiceType | null;
		}>
	>;
}) {
	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<FormSchema>({
		defaultValues: {
			...queryFilters,
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isDirty, isSubmitted },
		handleSubmit: handleRhfSubmit,
		watch,
	} = form;
	const { invoiceNo, issueNo, recipient, status, type } = watch();

	function handleSubmit(values: FormSchema) {
		setQueryFilters({ ...values });
	}

	useEffect(() => {
		if (isDirty || isSubmitted) {
			formRef.current?.requestSubmit();
		}
	}, [isDirty, isSubmitted, invoiceNo, issueNo, recipient, status, type]);

	return (
		<div className="px-6">
			<Form {...form}>
				<form
					ref={formRef}
					className="grid grid-cols-12 gap-3"
					onSubmit={handleRhfSubmit(handleSubmit)}
				>
					<FormField
						control={control}
						name="invoiceNo"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>شناسه فاکتور:</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="issueNo"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>شماره سپیدار:</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="recipient"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>گیرنده:</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="status"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>وضعیت:</FormLabel>
								<FormControl>
									<Select
										value={field.value ?? "all"}
										onValueChange={(value) => {
											field.onChange(value === "all" ? null : value);
										}}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{extendedInvoiceStatusOptions.map((x) => (
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
						name="type"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>نوع فاکتور:</FormLabel>
								<FormControl>
									<Select
										value={field.value ?? "all"}
										onValueChange={(value) => {
											field.onChange(value === "all" ? null : value);
										}}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{extendedInvoiceTypeOptions.map((x) => (
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
				</form>
			</Form>
		</div>
	);
}

export { InvoiceListFilter };
