"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaX } from "react-icons/fa6";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getBranches } from "@/branches/services/getBranches";
import { Buyer } from "@/buyers/models/Buyer";
import { BuyerQueryFilter } from "@/buyers/models/BuyerQuery";
import { getBuyers } from "@/buyers/services/getBuyers";
import { searchBuyerName } from "@/buyers/utils/searchBuyerName";
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
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
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
import { ContractNumberQueryFilter } from "@/contract-number/models/ContractNumberQuery";
import { Input } from "@/form/Input";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { cn } from "@/lib/utils";
import { SelectItemType } from "@/types/SelectItem";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	title: z.string(),
	cn: z.string(),
	buyer: z.custom<Buyer>(),
	customer: z.custom<UserLookup>(),
	branchId: z.string(),
	proforma: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

function ContractFilter({
	filterArgs,
	onFilterArgsUpdate,
}: {
	filterArgs: ContractNumberQueryFilter;
	onFilterArgsUpdate: (filterArgs: ContractNumberQueryFilter) => void;
}) {
	const { identity } = useLoggedInUser();

	const { branchOptions } = useBranchOptions();

	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<FormSchema>({
		defaultValues: {
			title: filterArgs.title ?? "",
			cn: filterArgs.cn ?? "",
			buyer: filterArgs.status ?? null,
			customer: filterArgs.customer ?? null,
			branchId: filterArgs.branchId ?? "",
			proforma: filterArgs.contractNo ?? "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isDirty, isSubmitted },
		watch,
	} = form;

	const { title, cn, buyer, customer, branchId, proforma } = watch();

	function handleSubmit(values: FormSchema) {
		onFilterArgsUpdate({ ...values });
	}

	useEffect(() => {
		if (isDirty || isSubmitted) {
			formRef.current?.requestSubmit();
		}
	}, [isDirty, isSubmitted, title, cn, customer, buyer, branchId, proforma]);

	return (
		<div className="px-6">
			<Form {...form}>
				<form
					ref={formRef}
					className="grid grid-cols-12 gap-3"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<FormField
						control={control}
						name="title"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>عنوان</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="cn"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>شماره قرارداد</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="buyer"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>خریدار</FormLabel>
								<FormControl>
									<BuyerSelect {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="customer"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>مشتری</FormLabel>
								<FormControl>
									<UserLookupSelect {...field} onValueChange={field.onChange} />
								</FormControl>
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name="proforma"
						render={({ field }) => (
							<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
								<FormLabel>شماره پروفرما</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
							</FormItem>
						)}
					/>

					{!identity.branchId && (
						<FormField
							control={control}
							name="branchId"
							render={({ field }) => (
								<FormItem className="col-span-full sm:col-span-4 md:col-span-3 lg:col-span-2">
									<FormLabel>شعبه</FormLabel>
									<FormControl>
										<Select
											value={field.value || "all"}
											onValueChange={(value) => {
												field.onChange(value === "all" ? "" : value);
											}}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent className="max-h-64">
												<SelectItem value="all">همه شعب</SelectItem>
												{/* <SelectItem value="headquarters">دفتر مرکزی</SelectItem> */}
												{branchOptions?.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
								</FormItem>
							)}
						/>
					)}
				</form>
			</Form>
		</div>
	);
}

function useBranchOptions() {
	const { identity } = useLoggedInUser();

	const [options, setOptions] = useState<SelectItemType[]>();

	useEffect(() => {
		const getBranchOptions = async () => {
			if (identity.branchId) return;

			try {
				const branches = await getBranches({ sort: { title: "asc" } });

				const options = branches.map((branch) => ({
					value: branch.id,
					label: branch.title,
				}));

				setOptions(options);
			} catch (err) {
				console.error(err);
			}
		};

		getBranchOptions();
	}, [identity.branchId]);

	return { branchOptions: options };
}

type BuyerSelectProps = {
	disabled?: boolean;
	value?: Buyer;
	onChange: (value?: Buyer) => void;
};

const BuyerSelect = forwardRef<any, BuyerSelectProps>(function BuyerSelect(
	{ disabled, value, onChange },
	ref,
) {
	const { identity } = useLoggedInUser();

	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isPending, setIsPending] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
	const [buyers, setBuyers] = useState<Buyer[]>();

	const handleSelect = useCallback(
		(_: unknown, buyer: Buyer) => {
			onChange(buyer);
			setSearchTerm("");
			setIsOpen(false);
		},
		[onChange],
	);

	useEffect(() => {
		(async () => {
			if (!debouncedSearchTerm) {
				setBuyers(undefined);
				return;
			}

			try {
				setIsPending(true);

				const filters: BuyerQueryFilter = {
					isDeleted: false,
					...searchBuyerName(debouncedSearchTerm),
				};

				if (identity.branchId) {
					filters.branches = identity.branchId;
				}

				const buyers = await getBuyers({
					filters,
					pagination: { page: 0, pageSize: 100 },
				});

				setBuyers(buyers.items);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات خریداران رخ داد.");
			} finally {
				setIsPending(false);
			}
		})();
	}, [debouncedSearchTerm, identity]);

	return (
		<div>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<div className="relative">
					<PopoverTrigger asChild>
						<Input
							ref={ref}
							className="pe-12 text-start"
							disabled={disabled}
							value={
								value?.name.trim() ||
								value?.nameEn?.trim() ||
								(value as any)?.metadata.nameEn?.trim() ||
								""
							}
							onClick={(event) => {
								if (disabled) {
									event.preventDefault();
								}
							}}
						/>
					</PopoverTrigger>

					{value && !disabled && (
						<div className="absolute bottom-0 end-[13px] top-0">
							<div
								className="flex h-full w-4 cursor-pointer items-center justify-center text-2xs text-muted-foreground"
								onClick={() => onChange(undefined)}
							>
								<FaX />
							</div>
						</div>
					)}
				</div>

				<PopoverContent align="start" className="p-0">
					<Command shouldFilter={false}>
						<CommandInput
							placeholder="جستجوی نام خریدار"
							value={searchTerm}
							slotProps={{
								root: { className: cn(!buyers && "border-b-0") },
							}}
							onValueChange={setSearchTerm}
						/>

						<CommandList>
							{isPending && <CommandLoading>در حال جستجو...</CommandLoading>}
							{buyers && <CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>}
							<CommandGroup>
								{buyers?.map((buyer) => (
									<CommandItem
										value={buyer.id}
										key={buyer.id}
										onSelect={handleSelect.bind(null, undefined, buyer)}
									>
										<div className="space-y-1">
											<div>{buyer.name.trim() || buyer.nameEn}</div>
											{buyer.name.trim() && buyer.nameEn.trim() && (
												<div className="text-xs text-muted-foreground">
													{buyer.nameEn}
												</div>
											)}
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
});

export { ContractFilter };
