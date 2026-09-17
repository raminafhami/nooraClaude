"use client";

import moment from "jalali-moment";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaCheck, FaPlus, FaX } from "react-icons/fa6";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { toast } from "sonner";
import { z } from "zod";

import GetAllProjectsTasksLabels from "@/api/tasks-manager/getAllProjectsTasksLabels";
import postNewTask from "@/api/tasks-manager/postNewTask";
import PostProjectsTasksLabel from "@/api/tasks-manager/postProjectsTasksLabel";
import uploadProjectTaskFiles from "@/api/tasks-manager/uploadProjectTaskFiles";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Conditional } from "@/components/ui/conditional";
import { DateInput } from "@/components/ui/date-input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { UserApi } from "@/identity/users/models/User";
import { messages } from "@/messages";
import PostNotifications from "@/notifications/services/postNotification";
import { projectTaskPriorityOptions } from "@/projects/enums/ProjectTaskPriority";
import {
	ProjectTaskReminderMethod,
	projectTaskReminderMethodOptions,
} from "@/projects/enums/ProjectTaskReminderMethod";
import { Project } from "@/projects/models/Project";
import { ProjectStatus } from "@/projects/models/ProjectStatus";
import { ProjectTaskLabel } from "@/projects/models/ProjectTaskLabel";
import { Loading } from "@/ui/Loader";
import { zodResolver } from "@hookform/resolvers/zod";

function TaskCreateDialog({
	payload,
	open,
	onClose,
}: {
	payload: { project: Project };
	open: boolean;
	onClose: (result?: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<Conditional mount={open} delay>
				<TaskCreateForm {...payload} onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

const schema = z.object({
	title: z.string().min(1, messages.validation.required),
	description: z.string(),
	assignee: z
		.string({ required_error: messages.validation.required })
		.min(1, messages.validation.required),
	deadline: z.string().min(1, messages.validation.required),
	priority: z
		.string({ required_error: messages.validation.required })
		.min(1, messages.validation.required),
	status: z
		.string({ required_error: messages.validation.required })
		.min(1, messages.validation.required),
	labels: z.custom<ProjectTaskLabel>().array(),
	reminder: z.string(),
	isConfidential: z.boolean().optional(),
	reminderMethod: z.custom<ProjectTaskReminderMethod>().optional(),
});

type FormSchema = z.infer<typeof schema>;

function TaskCreateForm({
	project,
	onClose,
}: {
	project: Project;
	onClose: (result?: boolean) => void;
}) {
	const { identity } = useLoggedInUser();

	const form = useForm<FormSchema>({
		defaultValues: {
			title: "",
			description: "",
			assignee: undefined,
			deadline: "",
			priority: undefined,
			status: undefined,
			labels: [],
			reminder: "",
			isConfidential: false,
			reminderMethod: undefined,
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
		watch,
	} = form;

	const { reminder } = watch();

	async function handleSubmit(values: FormSchema) {
		setIsLoadingSubmit(true);
		try {
			const createdTask = await postNewTask({
				project: project.id,
				title: values.title,
				description: values.description,
				assignee: values.assignee,
				deadline: moment(values.deadline, "jYYYY/jMM/jDD").toISOString(),
				priority: Number(values.priority),
				status: values.status,
				progress: 0,
				labels: values.labels.map((x) => x.id),
				reminder: values.reminder
					? moment(values.reminder, "jYYYY/jMM/jDD HH:mm").toISOString()
					: undefined,
				reminderMethod: values.reminder ? values.reminderMethod : undefined,
				isConfidential: values.isConfidential,
			});

			if (attachments.length) {
				await uploadProjectTaskFiles({
					attachments,
					taskId: createdTask.result.id,
				});
			}

			if (identity.id !== values.assignee) {
				await PostNotifications({
					title: `تسک  ${values.title} به شما اختصاص داده شد.`,
					description: values.description ?? "",
					category: `tasks:${createdTask.result.id}`,
					groups: [],
					users: [values.assignee],
					priority: "high",
					sendNotification: true,
				}).catch((err) => {
					console.error(err);
					toast.error(
						"خطای نامشخصی در هنگام ایجاد اعلان برای فرد مسئول رخ داد.",
					);
				});
			}
			setIsLoadingSubmit(false);
			toast.success("تسک مورد نظر با موفقیت ایجاد شد.");

			onClose(true);
		} catch (err: any) {
			console.error(err);

			setError("root.server", {
				message: err?.message || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	const [isLoadingLabels, setIsLoadingLabels] = useState<boolean>(true);
	const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
	const [isPendingLabel, setIsPendingLabel] = useState<boolean>(false);
	const [labelSearchTerm, setLabelSearchTerm] = useState<string>("");
	const [labels, setLabels] = useState<ProjectTaskLabel[]>();
	const [attachments, setAttachments] = useState<File[]>([]);

	const filteredLabels = useMemo<ProjectTaskLabel[] | undefined>(
		() =>
			labelSearchTerm
				? labels?.filter((x) => x.title.includes(labelSearchTerm))
				: labels,
		[labelSearchTerm, labels],
	);

	useEffect(() => {
		(async () => {
			try {
				setIsLoadingLabels(true);
				const labels = await GetAllProjectsTasksLabels({
					page: 0,
					size: 9999,
				}).then((response) => response.result.data);

				setLabels(labels);
			} catch (err: any) {
				toast.error("خطای نامشخصی در هنگام دریافت برچسب ها رخ داد.");
			} finally {
				setIsLoadingLabels(false);
			}
		})();
	}, []);

	return (
		<DialogContent className="max-w-screen-md">
			<DialogHeader>
				<DialogTitle>ایجاد تسک جدید</DialogTitle>
			</DialogHeader>

			<Spinner loading={isLoadingLabels}>
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
									name="description"
									render={({ field }) => (
										<FormItem className="col-span-full">
											<FormLabel>توضیحات</FormLabel>
											<FormControl>
												<Textarea {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<div className="col-span-full space-y-2">
									<label>آپلود فایل</label>
									<FileDropzone onFilesAdded={setAttachments} />
								</div>

								<FormField
									control={control}
									name="assignee"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												مسئول<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Select
													value={field.value ?? ""}
													onValueChange={field.onChange}
												>
													<SelectTrigger ref={field.ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{(project.members as UserApi[]).map((x) => (
															<SelectItem key={x.id} value={x.id}>
																{`${x.name} ${x.lastname}`}
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
									name="deadline"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												زمان<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<DateInput
													format="YYYY/MM/DD"
													openOnSelect
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="priority"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												اولویت<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Select
													value={field.value ?? ""}
													onValueChange={field.onChange}
												>
													<SelectTrigger ref={field.ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{projectTaskPriorityOptions.map((x) => (
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
									name="status"
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6">
											<FormLabel>
												وضعیت<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Select
													value={field.value ?? ""}
													onValueChange={field.onChange}
												>
													<SelectTrigger ref={field.ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{(project.statuses as ProjectStatus[]).map((x) => (
															<SelectItem key={x.id} value={x.id}>
																{x.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator className="col-span-full" />

								<FormField
									control={control}
									name="labels"
									render={({ field }) => (
										<>
											<FormItem className="col-span-full sm:col-span-6">
												<FormLabel>برچسب ها</FormLabel>
												<FormControl>
													<Popover>
														<PopoverTrigger asChild>
															<Input className="text-start" value="" />
														</PopoverTrigger>
														<PopoverContent
															align="start"
															className="w-full p-0"
														>
															<Command shouldFilter={false}>
																<CommandInput
																	value={labelSearchTerm}
																	onValueChange={setLabelSearchTerm}
																/>
																<CommandList className="py-1">
																	<CommandEmpty>
																		هیچ موردی یافت نشد.
																	</CommandEmpty>
																	<CommandGroup>
																		{filteredLabels?.map((label) => (
																			<CommandItem
																				className="rounded-none"
																				value={label.id}
																				key={label.id}
																				onSelect={() => {
																					const checked = field.value.some(
																						(x) => x.id === label.id,
																					);

																					field.onChange(
																						checked
																							? field.value.filter(
																									(x) => x.id !== label.id,
																								)
																							: [...field.value, label],
																					);
																				}}
																			>
																				<div className="w-4">
																					{field.value.some(
																						(x) => x.id === label.id,
																					) && <FaCheck />}
																				</div>
																				<span>{label.title}</span>
																			</CommandItem>
																		))}
																		{labelSearchTerm &&
																			filteredLabels &&
																			!filteredLabels.some(
																				(x) => x.title === labelSearchTerm,
																			) && (
																				<CommandItem
																					className="rounded-none"
																					disabled={isPendingLabel}
																					value=""
																					onSelect={async () => {
																						try {
																							setIsPendingLabel(true);

																							const createdLabel =
																								await PostProjectsTasksLabel({
																									title: labelSearchTerm,
																								}).then(
																									(response) => response.result,
																								);

																							field.onChange([
																								...field.value,
																								createdLabel,
																							]);

																							setLabels((prev) => [
																								...(prev ?? []),
																								createdLabel,
																							]);
																						} catch (err: any) {
																							console.error(err);
																							toast.error(
																								"خطای نامشخصی در هنگام ایجاد برچسب رخ داد.",
																							);
																						} finally {
																							setIsPendingLabel(false);
																						}
																					}}
																				>
																					<div className="w-4">
																						<Spinner
																							loading={isPendingLabel}
																							size="xs"
																						>
																							<FaPlus />
																						</Spinner>
																					</div>
																					<span>{`ایجاد برچسب جدید «${labelSearchTerm}»`}</span>
																				</CommandItem>
																			)}
																	</CommandGroup>
																</CommandList>
															</Command>
														</PopoverContent>
													</Popover>
												</FormControl>
												<FormMessage />
											</FormItem>

											{!!field.value?.length && (
												<div className="col-span-full flex gap-x-2 gap-y-3">
													{field.value.map((label) => (
														<Badge
															key={label.id}
															className="bg-gray-100 text-gray-900"
														>
															<FaX
																className="cursor-pointer text-2xs"
																onClick={() => {
																	field.onChange(
																		field.value.filter(
																			(x) => x.id !== label.id,
																		),
																	);
																}}
															/>
															<span>{label.title}</span>
														</Badge>
													))}
												</div>
											)}
										</>
									)}
								/>

								<Separator className="col-span-full" />

								<FormField
									control={control}
									name="reminder"
									render={({ field }) => (
										<FormItem className="col-span-full !col-start-1 sm:col-span-6">
											<FormLabel>یادآور</FormLabel>
											<FormControl>
												<DateInput
													format="YYYY/MM/DD HH:mm"
													openOnSelect
													plugins={[
														<TimePicker
															key="timepicker"
															hideSeconds
															position="left"
														/>,
													]}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="isConfidential"
									render={({ field }) => {
										return (
											<FormItem className="col-span-full col-start-1 flex items-center gap-4 sm:col-span-2">
												<FormLabel className="mt-2 text-nowrap">
													محرمانه ؟
												</FormLabel>
												<FormControl>
													<Switch
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
											</FormItem>
										);
									}}
								/>
								{reminder && (
									<FormField
										control={control}
										name="reminderMethod"
										render={({ field }) => (
											<FormItem className="col-span-full !col-start-1 sm:col-span-6">
												<FormLabel>
													نحوه یادآوری<span className="text-red-600"> *</span>
												</FormLabel>
												<FormControl>
													<Select
														value={field.value ?? ""}
														onValueChange={field.onChange}
													>
														<SelectTrigger ref={field.ref}>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{projectTaskReminderMethodOptions.map((x) => (
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
										shouldUnregister
									/>
								)}
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
									افزودن
									{isLoadingSubmit && <Loading size="xs" />}
								</Button>

								<Button type="button" variant="ghost" onClick={() => onClose()}>
									بازگشت
								</Button>
							</div>
						</fieldset>
					</form>
				</Form>
			</Spinner>
		</DialogContent>
	);
}

export { TaskCreateDialog };
