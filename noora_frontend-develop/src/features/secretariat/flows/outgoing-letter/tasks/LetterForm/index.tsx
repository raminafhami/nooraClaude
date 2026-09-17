"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import {
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskCancel } from "@/felo/tasks/hooks/useTaskCancel";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { messages } from "@/messages";

import { EmailRecipientsWidget } from "../../components/EmailRecipientsWidget";
import { InspectionCaseNosWidget } from "../../components/InspectionCaseNosWidget";
import { LetterAiCreateButton } from "../../components/LetterAiCreateButton";
import { LetterAiEditButton } from "../../components/LetterAiEditButton";
import { LetterDownloadButton } from "../../components/LetterDownloadButton";
import { LetterEditor } from "../../components/LetterEditor";
import { PhysicalRecipientsWidget } from "../../components/PhysicalRecipientsWidget";
import { ReviewerSelect } from "../../components/ReviewerSelect";
import { TranscriptionsWidget } from "../../components/TranscriptionsWidget";
import {
	LetterConfidentiality,
	letterConfidentialityOptions,
} from "../../enums/LetterConfidentiality";
import {
	LetterPriority,
	letterPriorityOptions,
} from "../../enums/LetterPriority";
import { SendType, sendTypeOptions } from "../../enums/SendType";
import {
	Assignees,
	assigneesTemplate,
	AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { Recipient } from "../../models/Recipient";
import { ReviewBy } from "../../models/ReviewBy";
import { Transcription } from "../../models/Transcription";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Assignees>(),
	[ids.letterFormStatus]: z.custom<ReviewStatus>(),
	[ids.letterFormNote]: z.string(),
	[ids.letterPriority]: z.custom<LetterPriority>(),
	[ids.letterConfidentiality]: z.custom<LetterConfidentiality>(),
	[ids.letterDate]: z.string(),
	[ids.letterHasAttachments]: z.boolean(),
	[ids.letterTo]: z.string(),
	[ids.letterToPosition]: z.string(),
	[ids.letterSubject]: z.string(),
	[ids.letterContent]: z.string(),
	[ids.letterTranscriptions]: z.custom<Transcription[]>(),
	[ids.relatedInspectionCaseNo]: z.string(),
	[ids.letterFollowingOfs]: z.string(),
	[ids.sendType]: z.custom<SendType>(),
	[ids.recipients]: z.custom<Recipient[]>(),
	[ids.needsToBeArchived]: z.boolean(),
	[ids.reviewBy]: z.custom<ReviewBy>(),
});

type FormSchema = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	const { openTaskCancelDialog } = useTaskCancel();

	const { control, setValue, watch } = useFormContext<FormSchema>();

	const { [ids.previousTask]: previousTask } = task.data;

	const fields = watch();
	const {
		[ids.letterHasAttachments]: hasAttachments,
		[ids.sendType]: sendType,
		[ids.needsToBeArchived]: archived,
		[ids.letterFormStatus]: reviewStatus,
	} = fields;

	const isPositiveStatus =
		typeof reviewStatus === "undefined" ||
		reviewStatus === ReviewStatus.Forward;
	const isNegativeStatus = reviewStatus === ReviewStatus.Cancel;

	useEffect(() => {
		if (!task.data[ids.letterContent]) {
			setValue(ids.letterContent, "با سلام و احترام،");
		}
	}, [task.data, setValue]);

	useEffect(() => {
		if (typeof hasAttachments === "undefined") {
			setValue(ids.letterHasAttachments, false);
		}
	}, [hasAttachments, setValue]);

	useEffect(() => {
		if (typeof archived === "undefined") {
			setValue(ids.needsToBeArchived, false);
		}
	}, [archived, setValue]);

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormSchema }) => {
				// initialize assignees
				if (!data[ids.assignees]) {
					data[ids.assignees] = {};
				}

				// set assignee:creator
				data[ids.assignees][AssigneeType.Creator] = {
					id: identity.id,
					name: identity.fullname,
				};

				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Creator,
					assigneeTitle: assigneesTemplate[AssigneeType.Creator],
					noteContent: data[ids.letterFormNote],
				};

				if (data[ids.letterFormStatus] === ReviewStatus.Forward) {
					// sanitize recipients
					if (data[ids.sendType] === SendType.Email) {
						data[ids.recipients] = data[ids.recipients].filter(
							(x) => x.type === "email",
						);
					} else if (data[ids.sendType] === SendType.Physical) {
						data[ids.recipients] = data[ids.recipients].filter(
							(x) => x.type === "physical",
						);
					} else {
						data[ids.recipients] = [];
					}

					// set reviewBy
					if (!data[ids.reviewBy]) {
						data[ids.reviewBy] = [];
					}

					const lastReviewer = data[ids.reviewBy].at(-1);
					if (
						!lastReviewer ||
						lastReviewer.id !== data[ids.assignees]?.[AssigneeType.Reviewer]?.id
					) {
						data[ids.reviewBy].push({
							id: data[ids.assignees]![AssigneeType.Reviewer]!.id,
							name: data[ids.assignees]![AssigneeType.Reviewer]!.id,
						});
					}
				} else if (data[ids.letterFormStatus] === ReviewStatus.Cancel) {
					await openTaskCancelDialog();
				}
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormSchema }) => {
				// update watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set stage
				await setStageOfInstance(
					task.instanceId,
					data[ids.letterFormStatus] === ReviewStatus.Cancel
						? "canceled"
						: "letter-review",
				);
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity, openTaskCancelDialog]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			{previousTask && (
				<>
					<PreviousTaskReferrer />
					<Separator className="col-span-full h-1" />
				</>
			)}

			<FormField
				control={control}
				name={ids.letterPriority}
				render={({ field: { ref, value, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							اولویت نامه
							{isPositiveStatus && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Select value={value} onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{letterPriorityOptions.map((x) => (
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
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			<FormField
				control={control}
				name={ids.letterConfidentiality}
				render={({ field: { ref, value, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							محرمانگی نامه
							{isPositiveStatus && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Select value={value} onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{letterConfidentialityOptions.map((x) => (
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
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.letterDate}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							تاریخ
							{isPositiveStatus && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<DateInput {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			<FormField
				control={control}
				name={ids.letterHasAttachments}
				render={({ field: { value, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel className="flex items-center gap-3">
							<FormControl>
								<Switch checked={value} onCheckedChange={onChange} {...field} />
							</FormControl>
							{value ? "دارای پیوست" : "بدون پیوست"}
						</FormLabel>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					validate: (value) => {
						if (isPositiveStatus && typeof value === "undefined")
							return messages.validation.required;
					},
				}}
			/>

			<Separator className="col-span-full h-1" />

			<div className="col-span-full">
				<LetterAiCreateButton />
			</div>

			<FormField
				control={control}
				name={ids.letterTo}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							به
							{isPositiveStatus && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Input {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			{isFieldInTaskForm(task, ids.letterToPosition) && (
				<FormField
					control={control}
					name={ids.letterToPosition}
					render={({ field }) => (
						<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
							<FormLabel>سمت</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
					rules={{}}
				/>
			)}

			<FormField
				control={control}
				name={ids.letterSubject}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>موضوع</FormLabel>
						<FormControl>
							<Input {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			{isFieldInTaskForm(task, ids.letterTranscriptions) && (
				<TranscriptionsWidget />
			)}

			<div className="col-span-full space-y-4">
				<LetterEditor />

				<div className="flex items-center gap-6">
					<div>
						<LetterAiEditButton />
					</div>

					<Separator orientation="vertical" className="h-8 w-0.5 rounded-xl" />

					<div className="flex items-center gap-3">
						<LetterDownloadButton values={fields} />
					</div>
				</div>
			</div>

			<Separator className="col-span-full h-1" />

			<InspectionCaseNosWidget />

			<FormField
				control={control}
				name={ids.letterFollowingOfs}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>پیرو نامه (ها)</FormLabel>
						<FormControl>
							<Input {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.sendType}
				render={({ field: { ref, value, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							نحوه ارسال
							{isPositiveStatus && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Select value={value} onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{sendTypeOptions.map((x) => (
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
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			{sendType === SendType.Email && <EmailRecipientsWidget />}

			{sendType === SendType.Physical && <PhysicalRecipientsWidget />}

			<FormField
				control={control}
				name={ids.needsToBeArchived}
				render={({ field: { value, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel className="flex items-center gap-3">
							<FormControl>
								<Checkbox
									checked={value}
									onCheckedChange={onChange}
									{...field}
								/>
							</FormControl>
							نیاز به بایگانی فیزیکی دارد.
						</FormLabel>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					validate: (value) => {
						if (isPositiveStatus && typeof value === "undefined")
							return messages.validation.required;
					},
				}}
			/>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.letterFormStatus}
				render={({ field: { ref, value, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							وضعیت<span className="text-red-600"> *</span>
						</FormLabel>
						<FormControl>
							<Select value={value} onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{reviewStatusOptions.map((x) => (
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
				rules={{ required: messages.validation.required }}
			/>

			{reviewStatus === ReviewStatus.Forward && <ReviewerSelect />}

			{isPositiveStatus && (
				<FormField
					control={control}
					name={ids.letterFormNote}
					render={({ field }) => (
						<FormItem className="col-span-full">
							<FormLabel>توضیحات</FormLabel>
							<FormControl>
								<Textarea className="min-h-48" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
					rules={{}}
				/>
			)}
		</div>
	);
}

const PhaseEntry: TaskDetailsReturn<FormSchema> = {
	schema,
	render: <PhasePage />,
};

export default PhaseEntry;
