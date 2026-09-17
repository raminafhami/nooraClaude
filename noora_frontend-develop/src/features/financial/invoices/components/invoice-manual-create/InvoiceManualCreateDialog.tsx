"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { FaTrash } from "react-icons/fa6";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandLoading,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
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
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { InstanceStatusBadge } from "@/felo/instances/components/InstanceStatusBadge";
import { Instance } from "@/felo/instances/models/Instance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { messages } from "@/messages";
import { toCurrency } from "@/utils/String";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	InvoiceRecipientType,
	invoiceRecipientTypeOptions,
} from "../../enums/InvoiceRecipientType";
import { InvoiceType, invoiceTypeOptions } from "../../enums/InvoiceType";
import { createManualInvoice } from "../../services/createManualInvoice";

const recipientTypeOptions = [
	{ label: "مشتری", value: "customer" },
	{ label: "شعبه", value: "branch" },
	{ label: "وارد کردن دستی", value: "manual" },
] as const;

type RecipientType = (typeof recipientTypeOptions)[number]["value"];

const schema = z
	.object({
		isFor: z.custom<RecipientType>(Boolean, messages.validation.required),
		recipient: z
			.object({
				name: z
					.string({ required_error: messages.validation.required })
					.min(1, messages.validation.required),
				lastname: z.string().optional(),
				type: z.custom<InvoiceRecipientType>().optional(),
				nationalCode: z.string().optional(),
				economicCode: z.string().optional(),
				registrationNo: z.string().optional(),
				postalCode: z.string().optional(),
				phone: z.string().optional(),
				fax: z.string().optional(),
				address: z.string().optional(),
				financialId: z
					.string({ required_error: messages.validation.required })
					.min(1, messages.validation.required),
			})
			.optional(),
		type: z.custom<InvoiceType>().optional(),
		instanceIds: z
			.array(z.string())
			.refine((x) => x.length, "افزودن حداقل یک درخواست الزامی است."),
	})
	.refine(({ isFor, recipient }) => isFor !== "manual" || recipient, {
		path: ["recipient"],
		message: messages.validation.required,
	});

type FormData = z.infer<typeof schema>;

function InvoiceManualCreateDialog({
	open,
	onClose,
}: DialogProps<void, boolean>) {
	const [instances, setInstances] = useState<Instance[]>([]);

	const form = useForm<FormData>({
		defaultValues: {
			isFor: undefined,
			recipient: undefined,
			type: undefined,
			instanceIds: [],
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		setError,
		watch,
		setValue,
	} = form;

	const { isFor } = watch();

	async function handleSubmit(values: FormData) {
		try {
			await createManualInvoice(values);
			toast.success("فاکتور با موفقیت ایجاد شد.");
			onClose(true);
		} catch (err) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ایجاد فاکتور رخ داد.",
			});
		}
	}

	const handleDelete = useCallback(
		(instanceId: string) => {
			setInstances((prevInstances) => {
				const updatedInstances = prevInstances.filter(
					(x) => x.id !== instanceId,
				);

				setValue(
					"instanceIds",
					updatedInstances.map((x) => x.id),
				);

				return updatedInstances;
			});
		},
		[setValue],
	);

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				className="max-w-screen-lg"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>افزودن فاکتور دستی جدید</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={handleRhfSubmit(handleSubmit)}>
						<fieldset
							className="space-y-8"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<div className="grid grid-cols-12 gap-6">
								<div className="col-span-full flex items-center gap-3">
									<span>مشخصات گیرنده</span>
									<Separator className="h-1 w-auto grow rounded" />
								</div>

								<FormField
									control={control}
									name="isFor"
									render={({ field: { ref, value, onChange, ...field } }) => (
										<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
											<FormLabel>
												نوع گیرنده<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Select
													value={value ?? ""}
													onValueChange={onChange}
													{...field}
												>
													<SelectTrigger ref={ref}>
														<SelectValue placeholder="-" />
													</SelectTrigger>
													<SelectContent>
														{recipientTypeOptions.map((x) => (
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

								{isFor === "manual" && (
									<FormField
										control={control}
										name="recipient"
										render={() => (
											<>
												<FormField
													control={control}
													name="recipient.financialId"
													render={({ field }) => (
														<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
															<FormLabel>شناسه طرف حساب</FormLabel>
															<span className="text-red-600"> *</span>
															<FormControl>
																<Input {...field} value={field.value ?? ""} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={control}
													name="recipient.name"
													render={({ field }) => (
														<FormItem className="col-span-full !col-start-1 sm:col-span-6 md:col-span-4">
															<FormLabel>
																نام
																<span className="text-red-600"> *</span>
															</FormLabel>
															<FormControl>
																<Input {...field} value={field.value ?? ""} />
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
																<Input {...field} value={field.value ?? ""} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>

												<FormField
													control={control}
													name="recipient.type"
													render={({
														field: { ref, value, onChange, ...field },
													}) => (
														<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
															<FormLabel>نوع</FormLabel>
															<FormControl>
																<Select
																	value={value ?? ""}
																	onValueChange={(value) =>
																		onChange(
																			value !== "clear" ? value : undefined,
																		)
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

												<FormField
													control={control}
													name="recipient.nationalCode"
													render={({ field }) => (
														<FormItem className="col-span-full sm:col-span-6 md:col-span-4">
															<FormLabel>شناسه/شماره ملی</FormLabel>
															<FormControl>
																<Input {...field} value={field.value ?? ""} />
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
																<Input {...field} value={field.value ?? ""} />
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
																<Input {...field} value={field.value ?? ""} />
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
																<Input {...field} value={field.value ?? ""} />
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
																<Input {...field} value={field.value ?? ""} />
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
																<Input {...field} value={field.value ?? ""} />
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
																<Input {...field} value={field.value ?? ""} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											</>
										)}
										shouldUnregister
									/>
								)}

								<div className="col-span-full flex items-center gap-3">
									<span>مشخصات کالا یا خدمات مورد معامله</span>
									<Separator className="h-1 w-auto grow rounded" />
								</div>

								<InstanceSelect setInstances={setInstances} />

								<FormField
									control={control}
									name="type"
									render={({ field: { ref, value, onChange, ...field } }) => (
										<FormItem className="col-span-full !col-start-1 sm:col-span-6 md:col-span-4">
											<FormLabel>نوع</FormLabel>
											<FormControl>
												<Select
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
														{value && <SelectItem value="clear">-</SelectItem>}

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
									name="instanceIds"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<Table
												slotProps={{
													wrapper: { className: "-mx-6" },
													root: { className: "rounded-none border-x-0" },
												}}
											>
												<TableHeader>
													<TableRow>
														<TableHead>#</TableHead>
														<TableHead>شماره درخواست</TableHead>
														<TableHead>نوع درخواست</TableHead>
														<TableHead>وضعیت</TableHead>
														<TableHead>خریدار</TableHead>
														<TableHead>مشتری</TableHead>
														<TableHead>قیمت کل</TableHead>
														<TableHead>عملیات</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{instances.length > 0 ? (
														instances.map((instance, index) => (
															<TableRow key={instance.id}>
																<TableCell>{index + 1}</TableCell>
																<TableCell>{instance.caseNo}</TableCell>
																<TableCell>{instance.processName}</TableCell>
																<TableCell>
																	{InstanceStatusBadge({ instance })}
																</TableCell>
																<TableCell>
																	{instance.parameters.Buyer?.name ? (
																		<>{instance.parameters.Buyer?.name}</>
																	) : (
																		<>-</>
																	)}
																</TableCell>
																<TableCell>
																	{instance.parameters.Assignees?.customer
																		?.name ? (
																		<>
																			{
																				instance.parameters.Assignees?.customer
																					?.name
																			}
																		</>
																	) : (
																		<>-</>
																	)}
																</TableCell>
																<TableCell>
																	{toCurrency(instance.parameters.InvoiceTotal)}
																</TableCell>
																<TableCell>
																	<TooltipProvider>
																		<TableActions>
																			<Tooltip>
																				<TableAction>
																					<TooltipTrigger asChild>
																						<Button
																							type="button"
																							className="h-full focus-within:text-red-600 hover:text-red-600 active:text-red-700"
																							size="icon"
																							variant="ghost"
																							onClick={() => {
																								handleDelete(instance.id);
																							}}
																						>
																							<FaTrash />
																						</Button>
																					</TooltipTrigger>
																					<TooltipContent>حذف</TooltipContent>
																				</TableAction>
																			</Tooltip>
																		</TableActions>
																	</TooltipProvider>
																</TableCell>
															</TableRow>
														))
													) : (
														<TableRow>
															<TableCell colSpan={100}>
																هنوز هیچ موردی انتخاب نشده است.
															</TableCell>
														</TableRow>
													)}
												</TableBody>
											</Table>
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
								<Button type="submit" className="xs:min-w-24" variant="primary">
									<Spinner color="white" loading={isSubmitting} size="xs">
										افزودن
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
		</Dialog>
	);
}

function InstanceSelect({
	setInstances,
}: {
	setInstances: React.Dispatch<React.SetStateAction<Instance[]>>;
}) {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
	const [instances, setLocalInstances] = useState<Instance[]>([]);
	const [isPending, setIsPending] = useState<boolean>(false);

	const {
		control,
		clearErrors,
		formState: { errors },
		setError,
		setValue,
		watch,
	} = useFormContext<FormData>();

	const handleSelect = useCallback(
		(instance: Instance) => {
			const instanceIds = watch("instanceIds");
			clearErrors("root.instanceSelect");
			if (instanceIds.includes(instance.id)) {
				setError("root.instanceSelect", {
					message: "انتخاب شده درخواست قبلا انتخاب شده است.",
				});
				return;
			}
			setInstances((prev) => [...prev, instance]);
			setValue("instanceIds", [...watch("instanceIds"), instance.id], {
				shouldValidate: true,
			});
			setIsOpen(false);
			setSearchTerm("");
		},
		[clearErrors, setInstances, setError, setValue, watch],
	);

	useEffect(() => {
		(async () => {
			if (!debouncedSearchTerm) {
				setLocalInstances([]);
				return;
			}

			try {
				setIsPending(true);

				const fetchedInstances = await getInstances({
					filters: [
						{
							name: "caseNo",
							value: { $regex: debouncedSearchTerm },
						},
						{
							name: "$or",
							value: [{ processDefinitionKey: { $regex: `^Inspection_Case` } }],
						},
					],
					props: [
						"Assignees",
						"Branch",
						"Buyer",
						"BuyerData",
						"CaseType",
						"InvoiceTotal",
					],
					page: { no: 0, size: 100 },
				});

				setLocalInstances(fetchedInstances.items);
			} catch (err) {
				console.error(err);
			} finally {
				setIsPending(false);
			}
		})();
	}, [debouncedSearchTerm]);

	return (
		<FormField
			control={control}
			name="instanceIds"
			render={() => (
				<FormItem className="col-span-full">
					<FormControl>
						<Popover open={isOpen} onOpenChange={setIsOpen}>
							<PopoverTrigger asChild>
								<Button
									className="w-full xs:w-auto"
									role="combobox"
									variant="default"
								>
									انتخاب درخواست
								</Button>
							</PopoverTrigger>
							<PopoverContent align="start" className="w-full min-w-96 p-0">
								<Command shouldFilter={false}>
									<CommandInput
										value={searchTerm}
										onValueChange={setSearchTerm}
										placeholder="جستجو بر اساس شماره درخواست"
									/>
									<CommandList>
										{isPending && (
											<CommandLoading>در حال جستجو...</CommandLoading>
										)}
										{!isPending && (
											<CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>
										)}
										<CommandGroup>
											{instances.map((instance) => (
												<CommandItem
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

					{errors.root?.instanceSelect && (
						<div className="text-xs text-destructive">
							{errors.root.instanceSelect.message}
						</div>
					)}
				</FormItem>
			)}
		/>
	);
}

export { InvoiceManualCreateDialog };
