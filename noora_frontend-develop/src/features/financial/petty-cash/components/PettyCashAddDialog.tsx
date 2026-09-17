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
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { createPettyCash } from "@/financial/petty-cash/services/createPettyCash";
import { handlePettyError } from "@/financial/petty/utils/handlePettyError";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { UserType } from "@/identity/users/models/UserType";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

import uploadPettyCashFile from "../services/uploadPettyCashFile";

const UserBankInfoSelectDialog = dynamic(
	() => import("@/identity/users/components/UserBankInfoSelectDialog"),
);

const formSchema = z.object({
	user: z.custom<UserLookup>(Boolean, messages.validation.required),
	title: z.string().min(1, messages.validation.required),
	amount: z.string().min(1, messages.validation.required),
	description: z.string(),
	bankShebaNumber: z
		.string()
		.refine((value) => !value || (value.length === 26 && isShebaValid(value)), {
			message: "شماره شبا وارد شده نامعتبر است.",
		}),
	bankCardNumber: z
		.string()
		.refine(
			(value) => !value || (value.length === 16 && verifyCardNumber(+value)),
			{
				message: "شماره کارت وارد شده نامعتبر است.",
			},
		),

	categoryIds: z
		.array(z.string())
		.refine((value) => value.length > 0, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function PettyCashAddDialog({
	open,
	onClose,
}: DialogProps<void, boolean | undefined>) {
	const dialog = useDialogs();

	const [searchValue, setSearchValue] = useState("");

	// cost categories
	const [categories, setCategories] = useState<
		(FinancialCategory & { costCenters: FinancialCategory[] })[]
	>([]);

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
					filters: { type: "petty" },
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

	// form
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			amount: "",
			description: "",
			user: undefined,
			categoryIds: [],
			bankShebaNumber: "",
			bankCardNumber: "",
		},
	});
	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
		handleSubmit,
		setValue,
		setError,
		watch,
	} = form;

	const { user } = watch();

	const [attachments, setAttachments] = useState<File[]>([]);

	async function onSubmit(data: FormSchema) {
		try {
			const res = await createPettyCash({
				title: data.title,
				amount: parseFloat(data.amount),
				description: data.description,
				userId: data.user?.id,
				categoryIds: data.categoryIds,
				bankCardNumber: data.bankCardNumber,
				bankShebaNumber: data.bankShebaNumber,
			});

			try {
				if (attachments.length) {
					await uploadPettyCashFile({
						attachments,
						pettyCashId: res.id,
					});
				}
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام بارگذاری پیوست ها رخ داد.");
			}

			onClose(true);
		} catch (err: any) {
			const errorMessage =
				handlePettyError(err.message) ||
				"خطای نامشخصی در هنگام ثبت تنخواه رخ داد.";

			setError("root.server", {
				message: errorMessage,
			});
			console.error(err);
		}
	}

	const handleUserBankInfoSelectDialog = useCallback(async () => {
		const result = await dialog.open(UserBankInfoSelectDialog, {
			userId: user.id,
		});
		if (result) {
			setValue("bankCardNumber", result.bankCardNumber ?? "");
			setValue("bankShebaNumber", result.bankSheba ?? "");
		}
	}, [dialog, setValue, user]);

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
					<DialogTitle>افزودن تنخواه</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
						<fieldset
							className="grid grid-cols-12 gap-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="user"
								render={({ field: { onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											کاربر<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<UserLookupSelect
												type={UserType.Personnel}
												{...field}
												onValueChange={onChange}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

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

							<Separator className="col-span-full h-0.5" />
							{user && (
								<div>
									<Button
										type="button"
										variant="outline"
										onClick={handleUserBankInfoSelectDialog}
									>
										انتخاب از حساب های کاربر
									</Button>
								</div>
							)}

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

							<Separator className="col-span-full h-0.5" />

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

																			return (
																				<CommandItem
																					key={costCenter.id}
																					className="px-4"
																					value={costCenter.id}
																					onSelect={() => {
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

														return (
															<div
																key={selectedId}
																className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs"
															>
																<span>{selectedItem.title}</span>
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

							<Separator className="col-span-full h-0.5" />

							<FormItem className="col-span-full">
								<FormLabel>پیوست ها</FormLabel>
								<FormControl>
									<FileDropzone onFilesAdded={setAttachments} />
								</FormControl>
								<FormMessage />
							</FormItem>
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
								افزودن
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

export { PettyCashAddDialog };
