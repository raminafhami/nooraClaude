"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
	FormMessage,
} from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { currency, Currency } from "@/enums/Currency";
import { Instance } from "@/felo/instances/models/Instance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { IncomeStatusBadge } from "@/financial/incomes/components/IncomeStatusBadge";
import { IncomeStatus } from "@/financial/incomes/enums/IncomeStatus";
import { Income } from "@/financial/incomes/models/Income";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { getObjectKeys } from "@/utils/object/getObjectKeys";
import { ObjectType } from "@/utils/object/ObjectType";
import { toCurrency } from "@/utils/String";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z
	.object({
		caseNo: z.string().min(1, messages.validation.required),
		incomes: z.custom<ObjectType<string, boolean>>(),
	})
	.refine(({ caseNo, incomes }) => !caseNo || getObjectKeys(incomes).length, {
		path: ["incomes"],
		message: "انتخاب حداقل یک درآمد الزامی است.",
	});

type FormData = z.infer<typeof schema>;

function InvoiceForceEditInspectionIncomeDialog({
	open,
	onClose,
}: {
	open: boolean;
	onClose: (result?: { incomes: Income[] }) => void;
}) {
	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<Conditional mount={open} delay>
				<IncomeForm onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

function IncomeForm({
	onClose,
}: {
	onClose: (result?: { incomes: Income[] }) => void;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [instanceIncomes, setIncomes] = useState<Income[]>();

	const form = useForm<FormData>({
		defaultValues: {
			caseNo: "",
			incomes: {},
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		setValue,
		watch,
	} = form;

	const { caseNo } = watch();

	async function handleSubmit(values: FormData) {
		const checkedIncomeIds = getObjectEntries(values.incomes)
			.filter(([_, checked]) => checked)
			.map(([key]) => key);

		const checkedIncomes: Income[] = [];
		checkedIncomeIds.forEach((id) => {
			const income = instanceIncomes?.find((x) => x.id === id);
			if (income) {
				checkedIncomes.push(income);
			}
		});

		onClose({
			incomes: checkedIncomes,
		});
	}

	const incomeQueryFn = useCallback(async () => {
		if (!caseNo) {
			setIncomes(undefined);
			return;
		}

		try {
			setIsLoading(false);
			const instanceIncomes = await getIncomes({
				filters: { caseNo, isDeleted: false },
				populate: ["categoryId"],
			});
			setIncomes(instanceIncomes);

			setValue(
				"incomes",
				instanceIncomes
					.filter((x) => x.status === IncomeStatus.Unpaid)
					.reduce<ObjectType<string, boolean>>((acc, curr) => {
						acc[curr.id] = false;
						return acc;
					}, {}),
			);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsLoading(false);
		}
	}, [caseNo, setValue]);

	useEffect(() => {
		incomeQueryFn();
	}, [incomeQueryFn]);

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
				<DialogTitle>افزودن درآمدهای درخواست بازرسی</DialogTitle>
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
							<InstanceSelect />

							<div className="col-span-full space-y-6">
								<div className="space-y-2">
									<div className="flex items-center gap-3">
										<span>درآمدهای درخواست</span>
										<Separator className="h-1 w-auto grow rounded" />
									</div>
									{typeof instanceIncomes === "undefined" && (
										<div className="text-muted-foreground">
											جهت نمایش درآمدها ابتدا درخواست مورد نظر خود را انتخاب
											کنید.
										</div>
									)}
								</div>

								<div className="space-y-4">
									{typeof instanceIncomes !== "undefined" && (
										<div className="-mx-6">
											<Table
												slotProps={{
													root: { className: "rounded-none border-x-0" },
												}}
											>
												<TableHeader>
													<TableRow>
														<TableHead className="w-14">
															{instanceIncomes.length > 0 && (
																<IncomeListCheckbox />
															)}
														</TableHead>
														<TableHead className="w-12">#</TableHead>
														<TableHead className="w-52">عنوان</TableHead>
														<TableHead className="w-48">مبلغ</TableHead>
														<TableHead className="w-40">وضعیت</TableHead>
														<TableHead>توضیحات</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{instanceIncomes.length ? (
														instanceIncomes.map((income, index) => (
															<IncomeItem
																key={income.id}
																income={income}
																index={index}
															/>
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
									)}
									<FormField
										control={control}
										name="incomes"
										render={() => (
											<FormItem>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						</div>

						{errors.root?.server && (
							<DestructiveAlert>
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<div className="flex flex-col gap-3 xs:flex-row-reverse">
							<Button
								className="xs:min-w-24"
								disabled={isSubmitting}
								variant="primary"
							>
								<Spinner color="white" loading={isSubmitting} size="sm">
									ثبت
								</Spinner>
							</Button>

							<Button
								disabled={isSubmitting}
								type="button"
								variant="ghost"
								onClick={() => onClose()}
							>
								بازگشت
							</Button>
						</div>
					</fieldset>
				</form>
			</Form>
		</DialogContent>
	);
}

function InstanceSelect() {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
	const [instances, setInstances] = useState<Instance[]>();

	const { clearErrors, control, setValue } = useFormContext<FormData>();

	const handleSelect = useCallback(
		async (instanceId: string) => {
			setSearchTerm("");
			setIsOpen(false);

			clearErrors();

			const instance = instances!.find((x) => x.id === instanceId)!;

			setValue("caseNo", instance.caseNo);
		},

		[instances, clearErrors, setValue],
	);

	useEffect(() => {
		(async () => {
			if (!debouncedSearchTerm) {
				setInstances(undefined);
				return;
			}

			try {
				setIsPending(true);

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
					props: [],
					page: { no: 0, size: 100 },
				});

				setInstances(instances.items);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
			} finally {
				setIsPending(false);
			}
		})();
	}, [debouncedSearchTerm]);

	return (
		<FormField
			control={control}
			name="caseNo"
			render={({ field }) => (
				<FormItem className="col-span-full">
					<FormControl>
						<Popover open={isOpen} onOpenChange={setIsOpen}>
							<PopoverTrigger disabled={!!field.value} asChild>
								<Button
									className="w-auto sm:w-44"
									role="combobox"
									variant="default"
								>
									{field.value ? (
										<div className="flex gap-2">
											<span>شماره درخواست:</span>
											<span className="tracking-wider">{field.value}</span>
										</div>
									) : (
										"انتخاب درخواست"
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent align="start" className="w-full min-w-96 p-0">
								<Command shouldFilter={false}>
									<CommandInput
										value={searchTerm}
										slotProps={{
											root: { className: cn(!instances && "border-b-0") },
										}}
										onValueChange={setSearchTerm}
									/>
									<CommandList>
										{isPending && (
											<CommandLoading>در حال جستجو...</CommandLoading>
										)}
										{instances && (
											<CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>
										)}
										<CommandGroup>
											{instances?.map((instance: any) => (
												<CommandItem
													value={instance.id}
													key={instance.id}
													onSelect={() => handleSelect(instance.id)}
												>
													<div className="flex items-center gap-3">
														<div className="tracking-wider">
															{instance.caseNo}
														</div>
														<div>{instance.processName}</div>
													</div>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function IncomeListCheckbox() {
	const { control, watch } = useFormContext<FormData>();

	const incomes = watch("incomes");

	const count = useMemo(() => getObjectKeys(incomes).length, [incomes]);
	const checkedCount = useMemo(
		() => getObjectEntries(incomes).filter(([_, checked]) => checked).length,
		[incomes],
	);

	if (!count) return;

	return (
		<FormField
			control={control}
			name={`incomes`}
			render={({ field }) => (
				<FormItem className="flex items-center justify-start">
					<FormControl>
						<Checkbox
							checked={
								checkedCount === count
									? true
									: checkedCount === 0
										? false
										: "indeterminate"
							}
							onCheckedChange={(checked) => {
								field.onChange(
									Object.fromEntries(
										getObjectKeys(incomes).map((incomeId) => [
											incomeId,
											!!checked,
										]),
									),
								);
							}}
						/>
					</FormControl>
				</FormItem>
			)}
		/>
	);
}

function IncomeItem({ income, index }: { income: Income; index: number }) {
	const { control, watch } = useFormContext<FormData>();

	const item = watch("incomes")[income.id];

	return (
		<TableRow className="whitespace-nowrap">
			<TableCell>
				{typeof item !== "undefined" && (
					<FormField
						control={control}
						name={`incomes`}
						render={({ field }) => (
							<FormItem className="flex items-center justify-start">
								<FormControl>
									<Checkbox
										checked={field.value[income.id]}
										onCheckedChange={(checked) => {
											const nextValue = { ...field.value };
											nextValue[income.id] = !!checked;
											field.onChange(nextValue);
										}}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				)}
			</TableCell>
			<TableCell>{index + 1}</TableCell>
			<TableCell>{income.category?.title}</TableCell>
			<TableCell>
				<div className="-mb-0.5 flex flex-col gap-1.5 text-xs">
					{income.currency &&
						income.currencyRate &&
						income.currency !== Currency.Rial && (
							<div>
								<span className="tracking-wide">{income.amount}</span>{" "}
								{currency[income.currency].title} با نرخ{" "}
								<span className="tracking-wide">
									{toCurrency(income.currencyRate.toString())}
								</span>{" "}
								ریال
							</div>
						)}

					<div>
						<span className="tracking-wide">
							{toCurrency(income.total.toString())}
						</span>{" "}
						ریال
					</div>
				</div>
			</TableCell>
			<TableCell>
				<IncomeStatusBadge status={income.status} />
			</TableCell>
			<TableCell>
				<div className="w-40 max-w-56 whitespace-normal">
					{income.description || "-"}
				</div>
			</TableCell>
		</TableRow>
	);
}

export { InvoiceForceEditInspectionIncomeDialog };
