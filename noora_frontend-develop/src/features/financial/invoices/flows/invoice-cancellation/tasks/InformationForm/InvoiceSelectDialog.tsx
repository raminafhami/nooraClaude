"use client";

import { useEffect, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandLoading,
} from "@/components/ui/command";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
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
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Instance } from "@/felo/instances/models/Instance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import { Invoice } from "@/financial/invoices/models/Invoice";
import { getInstanceInvoices } from "@/financial/invoices/services/getInstanceInvoices";
import { getInvoices } from "@/financial/invoices/services/getInvoices";
import { getInvoiceNoSequence } from "@/financial/invoices/utils/getInvoiceNoSequence";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { SelectItemType } from "@/types/SelectItem";
import { toCurrency } from "@/utils/String";
import { zodResolver } from "@hookform/resolvers/zod";

function InvoiceSelectDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: (result?: Invoice) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onClose.bind(undefined, undefined)}>
			<Conditional mount={open} delay>
				<InvoiceSelectForm onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

const typeOptions: SelectItemType[] = [
	{ value: "invoiceNo", label: "شناسه فاکتور" },
	{ value: "issueNo", label: "شماره سپیدار" },
	{ value: "caseNo", label: "شماره درخواست" },
];

const schema = z
	.object({
		type: z.string().min(1, messages.validation.required),
		invoiceOrIssueNo: z.string().optional(),
		invoice: z.custom<Invoice>().optional(),
	})
	.refine(
		({ type, invoiceOrIssueNo }) => {
			if ((type === "invoiceNo" || type === "issueNo") && !invoiceOrIssueNo) {
				return false;
			}

			return true;
		},
		{ path: ["invoiceOrIssueNo"], message: messages.validation.required },
	)
	.refine(
		({ type, invoice }) => {
			if (type === "caseNo" && !invoice) {
				return false;
			}

			return true;
		},
		{
			path: ["invoice"],
			message: "انتخاب یک مورد فاکتور الزامی است.",
		},
	);

type FormSchema = z.infer<typeof schema>;

function InvoiceSelectForm({
	onClose,
}: {
	onClose: (result?: Invoice) => void;
}) {
	const form = useForm<FormSchema>({
		defaultValues: {
			type: "",
			invoice: undefined,
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		setError,
		setValue,
		watch,
	} = form;

	const { type } = watch();

	async function handleSubmit(values: FormSchema) {
		try {
			let invoice: Invoice | undefined = values.invoice;

			if (!invoice) {
				if (values.type === "invoiceNo") {
					invoice = await getInvoices({
						filters: { invoiceNo: values.invoiceOrIssueNo },
					})
						.then(parseInvoice)
						.then((invoices) => invoices.at(0));
				} else if (values.type === "issueNo") {
					invoice = await getInvoices({
						filters: { issueNo: values.invoiceOrIssueNo },
					})
						.then(parseInvoice)
						.then((invoices) => invoices.at(0));
				}

				if (!invoice) {
					setError("invoiceOrIssueNo", {
						message: "فاکتور مورد نظر یافت نشد.",
					});
					return;
				}

				if (!invoice.issueNo && !invoice.issuedAt) {
					setError("invoiceOrIssueNo", {
						message: "تنها امکان انتخاب فاکتور صادر شده در سپیدار وجود دارد.",
					});
					return;
				}

				if (invoice.status !== InvoiceStatus.Issued) {
					setError("invoiceOrIssueNo", {
						message: "فاکتور مورد نظر در وضعیت مجاز جهت لغو نیست.",
					});
					return;
				}
			}

			onClose(invoice);
		} catch (err) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<DialogContent
			className="max-w-screen-sm"
			onInteractOutside={(event) => {
				if (isDirty) event.preventDefault();
			}}
		>
			<DialogHeader>
				<DialogTitle>انتخاب فاکتور</DialogTitle>
			</DialogHeader>

			<Form {...form}>
				<form
					onSubmit={async (e) => {
						e.stopPropagation();
						await form.handleSubmit(handleSubmit)(e);
					}}
				>
					<fieldset
						className="space-y-8"
						disabled={isSubmitting || isSubmitSuccessful}
					>
						<div className="grid grid-cols-12 gap-6">
							<FormField
								control={control}
								name="type"
								render={({ field }) => (
									<FormItem className="col-span-full xs:col-span-6">
										<FormLabel>
											نحوه انتخاب <span className="text-red-600">*</span>
										</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? ""}
												onValueChange={field.onChange}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{typeOptions.map((x) => (
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

							{(type === "invoiceNo" || type === "issueNo") && (
								<FormField
									control={control}
									name="invoiceOrIssueNo"
									render={({ field }) => (
										<FormItem className="col-span-full xs:col-span-6">
											<FormLabel>
												{type === "invoiceNo" ? "شناسه فاکتور" : "شماره سپیدار"}{" "}
												<span className="text-red-600">*</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{type === "caseNo" && <InstanceInvoiceSelect />}
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
									انتخاب
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

function InstanceInvoiceSelect() {
	const { control, clearErrors } = useFormContext<FormSchema>();

	const [isOpen, setIsOpen] = useState<boolean>(false);

	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [instances, setInstances] = useState<Instance[]>();

	useEffect(() => {
		(async () => {
			if (!debouncedSearchTerm) {
				setInstances(undefined);
				return;
			}

			try {
				setIsLoading(true);

				const instances = await getInstances({
					filters: [
						{
							name: "caseNo",
							value: { $regex: debouncedSearchTerm, $options: "i" },
						},
						{
							name: "$or",
							value: [
								{ processDefinitionKey: { $regex: `^Inspection_Case` } },
								{ processDefinitionKey: { $regex: `Sampling$` } },
							],
						},
					],
					props: ["Assignees", "Branch", "Buyer", "BuyerData", "CaseType"],
					page: { no: 0, size: 100 },
				});

				setInstances(instances.items);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [debouncedSearchTerm]);

	const [isLoadingInvoices, setIsLoadingInvoices] = useState<boolean>(false);
	const [invoices, setInvoices] = useState<Invoice[]>();
	const [selected, setSelected] = useState<Instance>();

	async function handleSelect(instance: Instance) {
		try {
			setIsLoadingInvoices(true);

			const invoices = await getInstanceInvoices(instance.id, {
				populate: ["items", "issuedBy"],
			}).then(parseInvoice);

			setInvoices(invoices);
			setSelected(instance);
			setIsOpen(false);

			clearErrors("invoice");
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoadingInvoices(false);
		}
	}

	return (
		<>
			<FormItem className="col-span-full xs:col-span-6">
				<FormLabel>
					شماره درخواست <span className="text-red-600">*</span>
				</FormLabel>
				<FormControl>
					<Popover open={isOpen} onOpenChange={setIsOpen}>
						<PopoverTrigger asChild className="text-start">
							<Input value={selected?.caseNo ?? ""} />
						</PopoverTrigger>
						<PopoverContent align="start" className="p-0">
							<Command shouldFilter={false}>
								<CommandInput
									value={searchTerm}
									slotProps={{
										root: {
											className: cn(!instances && "border-b-0"),
										},
									}}
									onValueChange={setSearchTerm}
								/>
								<CommandList>
									{isLoading && (
										<CommandLoading>در حال جستجو...</CommandLoading>
									)}
									{instances && (
										<CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>
									)}
									<CommandGroup>
										{instances?.map((instance) => (
											<CommandItem
												value={instance.id}
												key={instance.id}
												onSelect={() => handleSelect(instance)}
											>
												<div className="flex items-center gap-3">
													<div className="tracking-wider">
														{instance.caseNo}
													</div>
													<div className="text-muted-foreground">
														{instance.processName}
													</div>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</FormControl>
			</FormItem>

			{invoices && (
				<FormField
					control={control}
					name="invoice"
					render={({ field }) => (
						<FormItem className="col-span-full">
							<FormControl>
								<div>
									<Table
										slotProps={{
											wrapper: { className: "-mx-6" },
											root: { className: "rounded-none border-x-0" },
										}}
									>
										<TableHeader>
											<TableRow className="whitespace-nowrap">
												{!!invoices.length && (
													<TableHead className="w-12"></TableHead>
												)}
												<TableHead className="w-24">شناسه فاکتور</TableHead>
												<TableHead className="w-24">
													شماره درخواست (ها)
												</TableHead>
												<TableHead className="w-40">مبلغ قابل پرداخت</TableHead>
												<TableHead className="w-52">وضعیت صدور</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{!!invoices.length ? (
												invoices.map((invoice) => {
													const isSelectable =
														(invoice.issueNo || invoice.issuedAt) &&
														invoice.status === InvoiceStatus.Issued;

													const isSelected = field.value?.id === invoice.id;

													return (
														<TableRow
															key={invoice.id}
															className={cn(
																"whitespace-nowrap",
																!isSelectable &&
																	"cursor-not-allowed opacity-50",
																field.value?.id === invoice.id &&
																	"bg-gradient-to-l from-primary-100 to-white",
															)}
														>
															<TableCell>
																{isSelectable && (
																	<div className="flex">
																		<Checkbox
																			checked={isSelected}
																			onCheckedChange={(checked) => {
																				field.onChange(
																					checked ? invoice : undefined,
																				);
																			}}
																		/>
																	</div>
																)}
															</TableCell>
															<TableCell>
																{getInvoiceNoSequence(invoice.invoiceNo)}
															</TableCell>
															<TableCell>
																{Array.from(
																	new Set(
																		invoice.items?.map((x) => x.caseNo),
																	) ?? [],
																).join("، ") || "-"}
															</TableCell>
															<TableCell>
																<span className="tracking-wide" dir="ltr">
																	{toCurrency(
																		(invoice.total + invoice.tax).toString(),
																	)}
																</span>
															</TableCell>
															<TableCell>
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
															</TableCell>
														</TableRow>
													);
												})
											) : (
												<TableRow className="whitespace-nowrap">
													<TableCell colSpan={100}>
														هیچ موردی یافت نشد.
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
					shouldUnregister
				/>
			)}
		</>
	);
}

export { InvoiceSelectDialog };
