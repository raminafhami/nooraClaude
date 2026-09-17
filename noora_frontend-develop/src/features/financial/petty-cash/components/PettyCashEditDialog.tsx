"use client";

import { Check, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { isShebaValid, verifyCardNumber } from "persian-tools";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaX } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps, useDialogs } from "@/components/ui/dialog/use-dialogs";
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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { handlePettyError } from "@/financial/petty/utils/handlePettyError";
import { messages } from "@/messages";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { zodResolver } from "@hookform/resolvers/zod";

import { PettyCashApi } from "../models/PettyCash";
import { updatePettyCash } from "../services/updatePettyCash";

const UserBankInfoSelectDialog = dynamic(
	() => import("@/identity/users/components/UserBankInfoSelectDialog"),
);

type PettyCashEditDialogProps = {
	item: PettyCashApi;
};

function PettyCashEditDialog({
	payload,
	open,
	onClose,
}: DialogProps<PettyCashEditDialogProps, string | boolean>) {
	const dialog = useDialogs();

	const [categories, setCategories] = useState<
		(FinancialCategory & { costCenters: FinancialCategory[] })[]
	>([]);

	const [searchValue, setSearchValue] = useState("");

	// form
	const formSchema = z.object({
		title: z.string(),
		amount: z
			.string()
			.min(1, messages.validation.required)
			.refine((value) => parseFloat(value) >= payload.item.amount, {
				message: "اعتبار فعلی باید بزرگتر از ارزش قبلی باشد.",
			}),
		description: z.string(),
		categoryIds: z
			.array(z.string())
			.refine((value) => value.length > 0, messages.validation.required),
		bankCardNumber: z
			.string()
			.refine(
				(value) => !value || (value.length === 16 && verifyCardNumber(+value)),
				{
					message: "شماره کارت وارد شده نامعتبر است.",
				},
			),
		bankShebaNumber: z
			.string()
			.refine(
				(value) => !value || (value.length === 26 && isShebaValid(value)),
				{
					message: "شماره شبا وارد شده نامعتبر است.",
				},
			),
	});

	type FormSchema = z.infer<typeof formSchema>;

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),

		defaultValues: {
			title: payload.item.title,
			amount: payload.item.amount.toString(),
			description: payload.item.description,
			bankCardNumber: payload.item.bankCardNumber,
			bankShebaNumber: payload.item.bankShebaNumber,
			categoryIds: asNavigationProp(payload.item.categoryIds).map((x) => x.id),
		},
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
		setError,
		setValue,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			await updatePettyCash(payload.item.id, {
				...values,
				amount:
					parseFloat(values.amount) !== payload.item.amount
						? parseFloat(values.amount)
						: undefined,
			});
			toast.success("تنخواه مورد نظر با موفقیت بروزرسانی شد");
			onClose(true);
		} catch (err: any) {
			console.error(err);

			const errorMessage =
				handlePettyError(err.message) ||
				"خطای نامشخصی در بروزرسانی تنخواه رخ داد.";

			setError("root.server", {
				message: errorMessage,
			});
		}
	}

	const handleSelectAccountDialogOpen = useCallback(async () => {
		const result = await dialog.open(UserBankInfoSelectDialog, {
			userId: asNavigationProp(payload.item.userId).id,
		});

		if (result) {
			setValue("bankCardNumber", result.bankCardNumber);
			setValue("bankShebaNumber", result.bankSheba ?? "");
		}
	}, [dialog, payload.item.userId, setValue]);

	const organizeCategories = (categories: FinancialCategory[]) => {
		const budgetCenters: (FinancialCategory & {
			costCenters: FinancialCategory[];
		})[] = [];

		categories.forEach((category) => {
			if (!category.parentId) {
				budgetCenters.push({
					...category,
					costCenters: [],
				});
			}
		});

		categories.forEach((category) => {
			if (category.parentId) {
				const parentBudgetCenter = budgetCenters.find(
					(center) => center.id === category.parentId,
				);

				if (parentBudgetCenter) {
					parentBudgetCenter.costCenters.push(category);
				}
			}
		});

		return budgetCenters.filter((center) => center.costCenters.length > 0);
	};

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const categories = await getFinancialCategories({
					filters: { type: "petty", isDeleted: false },
					sort: { code: "asc" },
				});

				setCategories(organizeCategories(categories));
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت مراکز هزینه رخ داد.");
			}
		};

		fetchCategories();
	}, []);

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				className="max-w-screen-xs"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>ویرایش تنخواه</DialogTitle>
				</DialogHeader>

				<Form {...form}>
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
								name="amount"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											اعتبار (ریال)<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputMode="numeric"
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

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="title"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											عنوان<span className="text-red-500"> *</span>
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
								name="categoryIds"
								render={({ field }) => {
									const filteredCategories = categories
										.map((budgetCenter) => ({
											...budgetCenter,
											costCenters: budgetCenter.costCenters.filter(
												(costCenter) => costCenter.title.includes(searchValue),
											),
										}))
										.filter(
											(budgetCenter) => budgetCenter.costCenters.length > 0,
										);

									const allCostCenterIds = categories.flatMap((cat) =>
										cat.costCenters.map((cc) => cc.id),
									);

									return (
										<FormItem className="col-span-full">
											<FormLabel>
												مراکز هزینه
												<span className="text-red-500"> *</span>
											</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														className="w-full justify-between"
													>
														<span className="truncate">
															{field.value && field.value.length > 0
																? (() => {
																		const selectedTitles = categories
																			.flatMap((cat) => cat.costCenters)
																			.filter((costCenter) =>
																				field?.value?.includes(costCenter.id),
																			)
																			.map((costCenter) => costCenter.title);

																		const firstFour = selectedTitles
																			.slice(0, 4)
																			.join("، ");
																		const hasMore = selectedTitles.length > 4;

																		return hasMore
																			? `${firstFour} ...`
																			: firstFour;
																	})()
																: "انتخاب مراکز هزینه"}
														</span>
														<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-full p-0">
													<Command shouldFilter={false}>
														<CommandInput
															placeholder="جستجوی مراکز هزینه..."
															value={searchValue}
															onValueChange={setSearchValue}
														/>
														<CommandList>
															<CommandGroup>
																<CommandItem
																	onSelect={() => {
																		if (
																			field.value?.length ===
																			allCostCenterIds.length
																		) {
																			field.onChange([]);
																		} else {
																			field.onChange(allCostCenterIds);
																		}
																	}}
																	className="px-4 font-medium"
																>
																	{field.value?.length ===
																	allCostCenterIds.length ? (
																		<Check className="h-4 w-4 opacity-100" />
																	) : (
																		<span className="w-4"></span>
																	)}
																	<span>انتخاب همه</span>
																</CommandItem>
															</CommandGroup>

															{filteredCategories.map((budgetCenter, index) => (
																<div key={budgetCenter.id}>
																	{!!index && (
																		<Separator className="mx-4 my-2 h-0.5 w-auto" />
																	)}

																	<div className="px-4 py-2 text-start font-bold">
																		{budgetCenter.title}
																	</div>
																	{budgetCenter.costCenters.map(
																		(costCenter) => {
																			const isSelected = field.value?.includes(
																				costCenter.id,
																			);
																			const isOriginal =
																				payload.item.categoryIds.some(
																					(cat: any) =>
																						cat.id === costCenter.id,
																				);

																			return (
																				<CommandItem
																					key={costCenter.id}
																					className={`px-4 ${isOriginal ? "cursor-not-allowed opacity-50" : ""}`}
																					value={costCenter.id}
																					onSelect={() => {
																						if (isOriginal) return;

																						if (isSelected) {
																							field.onChange(
																								field?.value?.filter(
																									(id) => id !== costCenter.id,
																								),
																							);
																						} else {
																							field.onChange([
																								...(field?.value || []),
																								costCenter.id,
																							]);
																						}
																					}}
																				>
																					{isSelected ? (
																						<Check className="h-4 w-4 opacity-100" />
																					) : (
																						<span className="w-4"></span>
																					)}
																					<span>{costCenter.title}</span>
																				</CommandItem>
																			);
																		},
																	)}
																</div>
															))}
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>

											{field.value && field.value.length > 0 && (
												<div className="mt-4 flex flex-wrap gap-2">
													{field.value.map((selectedId) => {
														const selectedItem = categories
															.flatMap((cat) => cat.costCenters)
															.find(
																(costCenter) => costCenter.id === selectedId,
															);

														if (!selectedItem) return null;

														const isOriginal = payload.item.categoryIds.some(
															(cat: any) => cat.id === selectedId,
														);

														return (
															<div
																key={selectedId}
																className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
																	isOriginal ? "bg-gray-200" : "bg-gray-100"
																}`}
															>
																<span>{selectedItem.title}</span>
																{!isOriginal && (
																	<Button
																		className="w-2"
																		size="icon"
																		variant="link"
																		type="button"
																		onClick={() => {
																			field.onChange(
																				field?.value?.filter(
																					(id) => id !== selectedId,
																				),
																			);
																		}}
																	>
																		<FaX size={10} />
																	</Button>
																)}
															</div>
														);
													})}
												</div>
											)}
											<FormMessage />
										</FormItem>
									);
								}}
							/>

							<div>
								<Button
									type="button"
									variant="outline"
									onClick={handleSelectAccountDialogOpen}
								>
									تغییر حساب
								</Button>
							</div>
							<FormField
								control={control}
								name="bankCardNumber"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel> شماره کارت</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="bankShebaNumber"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel> شماره شبا</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="description"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel> توضیحات</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
						</fieldset>

						{errors.root?.server && (
							<DestructiveAlert className="col-span-full">
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<DialogFooter>
							<Button className="min-w-24" type="submit" variant="primary">
								بروزرسانی
							</Button>

							<Button
								type="button"
								variant="ghost"
								onClick={onClose.bind(null, undefined)}
							>
								بازگشت
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default PettyCashEditDialog;
