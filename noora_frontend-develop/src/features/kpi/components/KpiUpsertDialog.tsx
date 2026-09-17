"use client";

import moment from "jalali-moment";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa6";
import { toast } from "sonner";
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
} from "@/components/ui/command";
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
	FormMessage,
} from "@/components/ui/form";
import { Input, inputClasses } from "@/components/ui/input";
import { MaskInput } from "@/components/ui/mask-input";
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
import { processGroup } from "@/felo/processes/models/ProcessGroup";
import { getProcesses } from "@/felo/processes/services/getProcesses";
import { groupDefinitions } from "@/felo/processes/utils/groupDefinitions";
import { UserGroupApi } from "@/identity/groups/models/Group";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserType } from "@/identity/users/models/UserType";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { SelectItemType } from "@/types/SelectItem";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { zodResolver } from "@hookform/resolvers/zod";

import { kpiTargetTypesOptions } from "../enums/KpiTargetType";
import { KpiApi } from "../models/Kpi";
import { createKpi } from "../services/createKpi";
import { getUserGroups } from "../services/getUserGroups";
import { updateKpi } from "../services/updateKpi";
import {
	monthlyTimeFrames,
	seasonalTimeFrames,
	timeFrames,
	yearlyTimeFrames,
} from "../utils/TimeFrames";

const currentMonthStart = moment().startOf("jMonth").add(0, "month");

const formSchema = z
	.object({
		title: z.string().min(1, messages.validation.required),
		targetType: z.string().min(1, messages.validation.required),
		user: z.object({
			id: z.string(),
			name: z.string(),
		}),
		groupId: z.string(),
		position: z.string(),
		processKeys: z.array(z.string()).min(1, messages.validation.required),
		timeFrame: z.string().min(1, messages.validation.required),
		startDate: z.string().min(1, messages.validation.required),
		targetAsFileCount: z.string(),
		targetAsSoldAmount: z.string(),
	})
	.refine((data) => data.targetAsFileCount || data.targetAsSoldAmount, {
		message: "حداقل یکی از دو فیلد هدف مورد نیاز است",
		path: ["targetAsFileCount"],
	})
	.superRefine((data, ctx) => {
		if (data.targetType === "user") {
			if (!data.user?.id) {
				ctx.addIssue({
					path: ["user"],
					code: z.ZodIssueCode.custom,
					message: messages.validation.required,
				});
			}

			if (!data.position) {
				ctx.addIssue({
					path: ["position"],
					code: z.ZodIssueCode.custom,
					message: messages.validation.required,
				});
			}
		} else {
			if (!data.groupId) {
				ctx.addIssue({
					path: ["groupId"],
					code: z.ZodIssueCode.custom,
					message: messages.validation.required,
				});
			}
		}
	});

type FormSchema = z.infer<typeof formSchema>;

type KpiUpsertDialogPayload = {
	item?: KpiApi;
};

function KpiUpsertDialog({
	payload,
	open,
	onClose,
}: DialogProps<KpiUpsertDialogPayload, string | boolean>) {
	const { processGroupOptions } = useProcessOptions();

	const form = useForm<FormSchema>({
		defaultValues: {
			title: payload.item?.title ?? "",
			targetType: payload.item?.targetType ?? "",
			user: asNavigationProp(payload.item?.userId) ?? undefined,
			groupId: asNavigationProp(payload.item?.groupId)?.id ?? "",
			position: payload.item?.position ?? "",
			processKeys: payload.item?.processKeys ?? [],
			timeFrame: payload.item?.timeFrame ?? "",
			startDate: payload.item?.startDate ?? "",
			targetAsFileCount: String(
				payload.item?.targets.find((t) => t.metric === "fileCount")?.value ??
					"",
			),
			targetAsSoldAmount: String(
				payload.item?.targets.find((t) => t.metric === "soldAmount")?.value ??
					"",
			),
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

	const { targetType, timeFrame, groupId } = watch();

	useEffect(() => {
		setValue("processKeys", []);
	}, [setValue, targetType]);

	const [userGroups, setUserGroups] = useState<UserGroupApi[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchValue, setSearchValue] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => {
			setSearchValue(searchTerm);
		}, 500);

		return () => clearTimeout(timeout);
	}, [searchTerm]);

	useEffect(() => {
		const groupsQueryFn = async () => {
			try {
				const groups = await getUserGroups({
					filters: { type: "group", title: searchValue },
					sort: { createdAt: "desc" },
				});

				setUserGroups(groups);
			} catch (err) {
				toast.error("خطای نامشخصی در هنگام دریافت گروه ها رخ داد");
			}
		};

		groupsQueryFn();
	}, [searchValue]);

	async function handleSubmit(values: FormSchema) {
		try {
			let data: any = {};
			data.targets = [];
			data.title = values.title;
			data.targetType = values.targetType;
			data.processKeys = values.processKeys;
			data.timeFrame = values.timeFrame;
			data.startDate = values.startDate;

			if (values.targetAsFileCount) {
				data.targets.push({
					metric: "fileCount",
					value: parseFloat(values.targetAsFileCount),
				});
			}

			if (values.targetAsSoldAmount) {
				data.targets.push({
					metric: "soldAmount",
					value: parseFloat(values.targetAsSoldAmount),
				});
			}

			if (timeFrame === "seasonal") {
				data.endDate = moment(values.startDate)
					.add(3, "month")
					.format("YYYY-MM-DD");
			} else if (timeFrame === "yearly") {
				data.endDate = moment(values.startDate)
					.add(1, "year")
					.format("YYYY-MM-DD");
			} else {
				data.endDate = moment(values.startDate)
					.add(1, "month")
					.format("YYYY-MM-DD");
			}

			if (data.targetType === "user") {
				data.userId = values.user.id;
				data.position = values.position;
			} else {
				data.groupId = values.groupId;
			}

			if (payload.item?.id) {
				await updateKpi(payload.item.id, { ...data });

				toast.success("شاخص عملکرد با موفقیت بروزرسانی شد.");
			} else {
				await createKpi({ ...data });

				toast.success("شاخص عملکرد با موفقیت ثبت شد.");
			}
			onClose(true);
		} catch {
			setError("root.server", {
				message: "خطای نامشخصی در بروزرسانی شاخص عملکرد رخ داد.",
			});
		}
	}

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
					<DialogTitle>
						{payload.item?.id ? "ویرایش شاخص عملکرد" : "افزودن شاخص عملکرد"}
					</DialogTitle>
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
								name="title"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											عنوان<span className="text-red-600"> *</span>
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
								name="targetType"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											نوع هدف گذاری<span className="text-red-600"> *</span>
										</FormLabel>
										<FormControl>
											<Select
												disabled={!!payload.item?.id}
												onValueChange={onChange}
												{...field}
											>
												<SelectTrigger ref={ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{kpiTargetTypesOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							{targetType === "user" && (
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
													onValueChange={onChange}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{targetType === "user" && (
								<FormField
									control={control}
									name="position"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-full">
											<FormLabel>
												سمت<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Select onValueChange={onChange} {...field}>
													<SelectTrigger ref={ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="coordinator">
															هماهنگ کننده
														</SelectItem>
														<SelectItem value="marketer">بازاریاب</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{targetType === "group" && (
								<FormField
									control={control}
									name="groupId"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormLabel>
												انتخاب گروه<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant="outline"
															role="combobox"
															className="w-full justify-between"
														>
															{userGroups.find((g) => g.id === field.value)
																?.title ?? "انتخاب کنید"}
															<ChevronDown className="ml-2 h-4 w-4 opacity-50" />
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-full p-0">
														<Command>
															<CommandInput
																placeholder="جستجو در گروه‌ها..."
																value={searchTerm}
																onValueChange={setSearchTerm}
															/>
															<CommandEmpty>هیچ گروهی یافت نشد</CommandEmpty>
															<CommandGroup>
																{userGroups.map((group) => (
																	<div
																		key={group.id}
																		className="flex w-full flex-row items-center justify-start gap-4 bg-gray-100 px-5"
																	>
																		<div className="w-1">
																			{groupId === group.id && <FaCheck />}
																		</div>

																		<CommandItem
																			key={group.id}
																			onSelect={() => field.onChange(group.id)}
																		>
																			{group.title}
																		</CommandItem>
																	</div>
																))}
															</CommandGroup>
														</Command>
													</PopoverContent>
												</Popover>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<FormField
								control={control}
								name="processKeys"
								render={({ field: { ref, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											نوع درخواست<span className="text-red-600"> *</span>
										</FormLabel>
										<FormControl>
											<Popover>
												<PopoverTrigger
													ref={ref}
													className={cn(inputClasses, "flex w-full")}
												>
													<div className="truncate">
														{!!field.value?.length
															? Object.values(processGroupOptions || {})
																	.flat()
																	.filter((item) =>
																		field.value.includes(item.value),
																	)
																	.map((item) => item.label)
																	.join("، ")
															: ""}
													</div>

													<div className="ms-auto flex h-full w-4 cursor-pointer items-center justify-center text-muted-foreground">
														<ChevronDown />
													</div>
												</PopoverTrigger>
												<PopoverContent className="max-h-64 w-full overflow-y-auto p-0">
													<Command shouldFilter>
														<CommandInput placeholder="جستجو..." />
														<CommandList>
															{processGroupOptions &&
																Object.entries(processGroupOptions).map(
																	([key, processes]) => (
																		<CommandGroup
																			key={key}
																			heading={processGroup[key]?.title}
																		>
																			{processes.map((process) => {
																				const isSelected =
																					field.value?.includes(process.value);
																				return (
																					<CommandItem
																						key={process.value}
																						onSelect={() => {
																							if (isSelected) {
																								field.onChange(
																									field.value.filter(
																										(val) =>
																											val !== process.value,
																									),
																								);
																							} else {
																								if (targetType !== "user") {
																									field.onChange([
																										process.value,
																									]);
																								} else {
																									field.onChange([
																										...(field.value || []),
																										process.value,
																									]);
																								}
																							}
																						}}
																						className="flex items-center justify-start"
																					>
																						{isSelected ? (
																							<FaCheck size={12} />
																						) : (
																							<div className="h-3 w-3"></div>
																						)}
																						<span>{process.label}</span>
																					</CommandItem>
																				);
																			})}
																		</CommandGroup>
																	),
																)}
														</CommandList>
													</Command>
												</PopoverContent>
											</Popover>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="timeFrame"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											بازه زمانی<span className="text-red-600"> *</span>
										</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{timeFrames.map(([label, value]) => (
														<SelectItem key={value} value={value}>
															{label}
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
								name="startDate"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											شروع از<span className="text-red-600"> *</span>
										</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{timeFrame === "monthly" &&
														monthlyTimeFrames
															.filter((item) =>
																moment(item.value).isSameOrAfter(
																	currentMonthStart,
																),
															)
															.map((item) => (
																<SelectItem key={item.value} value={item.value}>
																	{item.label}
																</SelectItem>
															))}

													{timeFrame === "seasonal" &&
														seasonalTimeFrames.map((item) => (
															<SelectItem key={item.value} value={item.value}>
																{item.label}
															</SelectItem>
														))}

													{timeFrame === "yearly" && (
														<>
															{yearlyTimeFrames.map((year) => (
																<SelectItem key={year.value} value={year.value}>
																	{year.label}
																</SelectItem>
															))}
														</>
													)}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="targetAsFileCount"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-6">
										<FormLabel>هدف بر اساس تعداد فایل</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputMode="numeric"
												inputRef={ref}
												mask={Number}
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
								name="targetAsSoldAmount"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-6">
										<FormLabel>هدف بر اساس مبلغ (ریال)</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputMode="numeric"
												inputRef={ref}
												thousandsSeparator=","
												mask={Number}
												unmask
												onAccept={(value) => onChange(value)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
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
								{payload.item ? "بروزرسانی" : "افزودن"}
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

function useProcessOptions() {
	const [groupOptions, setGroupOptions] = useState<{
		[key: string]: SelectItemType[];
	}>();

	useEffect(() => {
		const getProcessOptions = async () => {
			try {
				const processes = await getProcesses({
					filters: {
						$or: [
							{ key: { $regex: `^Inspection_Case` } },
							{ key: { $regex: `Sampling$` } },
						],
					},
					sort: { name: "asc" },
				});

				const uniqueDefinitions = new Map();
				processes.forEach((definition) => {
					uniqueDefinitions.set(definition.key, definition);
				});

				const groupedDefinitions = groupDefinitions(
					Array.from(uniqueDefinitions.values()),
				);

				const groupOptions = getObjectEntries(groupedDefinitions)
					.map(([key, processes]) => ({
						[key]: processes.map((definition) => ({
							value: definition.key,
							label: definition.name,
						})),
					}))
					.reduce((acc, curr) => ({ ...acc, ...curr }), {});

				setGroupOptions(groupOptions);
			} catch (err) {
				console.error(err);
			}
		};

		getProcessOptions();
	}, []);

	return {
		processGroupOptions: groupOptions,
	};
}

export default KpiUpsertDialog;
