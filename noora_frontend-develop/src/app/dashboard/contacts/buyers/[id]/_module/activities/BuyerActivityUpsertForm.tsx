"use client";

import moment from "jalali-moment";
import { useForm } from "react-hook-form";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { z } from "zod";

import {
	ActivityType,
	activityTypeOptions,
	activityTypes,
} from "@/activities/enums/ActivityType";
import { Activity } from "@/activities/models/Activity";
import { createActivity } from "@/activities/services/createActivity";
import { updateActivity } from "@/activities/services/updateActivity";
import { isApiResponse } from "@/api/utils/isApiResponse";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
	DialogContent,
	DialogFooter,
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { UserApi } from "@/identity/users/models/User";
import { messages } from "@/messages";
import { ProjectLabelSelect } from "@/projects/components/ProjectLabelSelect";
import { ProjectLabelSelectDisplay } from "@/projects/components/ProjectLabelSelectDisplay";
import {
	ProjectTaskReminderMethod,
	projectTaskReminderMethodOptions,
} from "@/projects/enums/ProjectTaskReminderMethod";
import { Project } from "@/projects/models/Project";
import { ProjectStatus } from "@/projects/models/ProjectStatus";
import { ProjectTaskLabel } from "@/projects/models/ProjectTaskLabel";
import { zodResolver } from "@hookform/resolvers/zod";

import { useBuyerContext } from "../useBuyerContext";

const schema = z
	.object({
		type: z.custom<ActivityType>(Boolean, messages.validation.required),
		title: z.string().min(1, messages.validation.required),
		description: z.string(),
		status: z.string().min(1, messages.validation.required),
		assignee: z.string().min(1, messages.validation.required),
		deadline: z.string().min(1, messages.validation.required),
		labels: z.custom<ProjectTaskLabel[]>(),
		reminder: z.string(),
		reminderMethod: z.custom<ProjectTaskReminderMethod>().optional(),
	})
	.refine(({ reminder, reminderMethod }) => !reminder || reminderMethod, {
		path: ["reminderMethod"],
		message: messages.validation.required,
	});

type ActivityCreateFormSchema = z.infer<typeof schema>;

function BuyerActivityCreateForm({
	activity,
	project,
	onClose,
}: {
	activity?: Partial<Activity>;
	project: Project;
	onClose: (activity?: Activity) => void;
}) {
	const { buyer } = useBuyerContext();

	const form = useForm<ActivityCreateFormSchema>({
		defaultValues: {
			type: activity?.type ?? undefined,
			title:
				activity?.title ??
				(activity?.type
					? `${buyer.name || buyer.nameEn} - ${activityTypes[activity.type].title}`
					: ""),
			description: activity?.description ?? "",
			status:
				((activity?.status &&
					(typeof activity.status === "string"
						? activity.status
						: activity.status.id)) ||
					(project.statuses.at(0) as ProjectStatus | undefined)?.id) ??
				undefined,
			assignee:
				(activity?.assignee &&
					(typeof activity.assignee === "string"
						? activity.assignee
						: activity.assignee.id)) ||
				"",
			deadline:
				(activity?.deadline &&
					moment(activity.deadline).format("jYYYY/jMM/jDD HH:mm")) ||
				"",
			labels: (activity?.labels as ProjectTaskLabel[]) ?? [],
			reminder:
				(activity?.reminder &&
					moment(activity.reminder).format("jYYYY/jMM/jDD HH:mm")) ||
				"",
			reminderMethod: activity?.reminderMethod ?? undefined,
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		setError,
		watch,
	} = form;

	const { reminder } = watch();

	async function handleSubmit(values: ActivityCreateFormSchema) {
		try {
			let upsertedActivity: Activity;

			const deadline = moment(values.deadline, "jYYYY/jMM/jDD HH:mm").toDate();
			const reminder = values.reminder
				? moment(values.reminder, "jYYYY/jMM/jDD HH:mm").toDate()
				: undefined;

			if (activity?.id) {
				upsertedActivity = await updateActivity(activity.id, {
					type: values.type,
					title: values.title,
					description: values.description,
					status: values.status,
					assignee: values.assignee,
					deadline,
					labels: values.labels?.map((x) => x.id),
					reminder: reminder ?? null,
					reminderMethod: values.reminderMethod ?? null,
				});
			} else {
				upsertedActivity = await createActivity({
					type: values.type,
					buyerId: buyer.id,
					title: values.title,
					description: values.description,
					status: values.status,
					assignee: values.assignee,
					deadline,
					labels: values.labels?.map((x) => x.id),
					reminder,
					reminderMethod: values.reminderMethod,
				});
			}

			onClose(upsertedActivity);
		} catch (err) {
			console.error(err);

			let errorMessage: string | undefined;
			if (isApiResponse(err)) {
				if (err.message === "reminder is not valid") {
					errorMessage = "یادآور باید زمانی در آینده تعیین شود.";
				} else if (err.message === "Assignee is not a member of the project") {
					errorMessage = "انتخاب مسئول مورد نظر امکان پذیر نیست.";
				} else if (err.message === "You are not able to modify this task") {
					errorMessage = "ویرایش این فعالیت برای شما امکان پذیر نیست.";
				}
			}

			setError("root.server", {
				message: errorMessage || "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	const Icon = activity?.type ? activityTypes[activity.type].icon : undefined;

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
				<DialogTitle>
					{activity?.id ? "بروزرسانی فعالیت" : "افزودن فعالیت جدید"}
				</DialogTitle>
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
							<FormField
								control={control}
								name="type"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 flex items-center gap-3 space-y-0 sm:col-span-6">
										<FormLabel>
											نوع فعالیت
											{!activity?.type && (
												<span className="text-red-600"> *</span>
											)}
										</FormLabel>
										{activity?.type && Icon ? (
											<div className="flex items-center gap-2">
												<div className="flex size-8 items-center justify-center rounded-xl bg-gray-100 p-1 text-base text-muted-foreground">
													<Icon />
												</div>
												<span>{activityTypes[activity.type].title}</span>
											</div>
										) : (
											<FormControl>
												<Select
													value={field.value ?? ""}
													onValueChange={field.onChange}
												>
													<SelectTrigger ref={field.ref}>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{activityTypeOptions.map((x) => (
															<SelectItem key={x.value} value={x.value}>
																{x.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
										)}
										<FormMessage />
									</FormItem>
								)}
							/>

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
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="status"
								render={({ field }) => (
									<FormItem className="col-span-full !col-start-1 sm:col-span-6">
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

							<FormField
								control={control}
								name="assignee"
								render={({ field }) => (
									<FormItem className="col-span-full col-start-1 sm:col-span-6">
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
									<FormItem className="col-span-full !col-start-1 sm:col-span-6">
										<FormLabel>
											زمان<span className="text-red-600"> *</span>
										</FormLabel>
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

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="labels"
								render={({ field }) => (
									<div className="col-span-full grid grid-cols-2 gap-x-6 gap-y-4">
										<FormItem className="col-span-full sm:col-span-1">
											<FormLabel>برچسب ها</FormLabel>
											<FormControl>
												<ProjectLabelSelect {...field} />
											</FormControl>
										</FormItem>

										<ProjectLabelSelectDisplay
											className="col-span-full"
											{...field}
										/>
									</div>
								)}
							/>

							<Separator className="col-span-full h-0.5" />

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

							{reminder && (
								<FormField
									control={control}
									name="reminderMethod"
									render={({ field }) => (
										<FormItem className="col-span-full col-start-1 sm:col-span-6">
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

						<DialogFooter>
							<Button className="min-w-24" type="submit" variant="primary">
								<Spinner loading={isSubmitting} size="sm">
									{activity?.id ? "بروزرسانی" : "افزودن"}
								</Spinner>
							</Button>

							<Button type="button" variant="ghost" onClick={() => onClose()}>
								بازگشت
							</Button>
						</DialogFooter>
					</fieldset>
				</form>
			</Form>
		</DialogContent>
	);
}

export { BuyerActivityCreateForm };
