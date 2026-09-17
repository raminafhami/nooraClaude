"use client";

import { useRouter } from "next/navigation";
import { useCallback, useReducer, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { getGroups } from "@/identity/groups/services/getGroups";
import { NotificationsPriority } from "@/notifications/models/NotificationsPriority";
import PostNotifications from "@/notifications/services/postNotification";
import { Loading } from "@/ui/Loader";
import { getObjectKeys } from "@/utils/object/getObjectKeys";
import { ObjectType } from "@/utils/object/ObjectType";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { TaskInnerContext } from "../contexts/TaskInnerContext";
import { TaskStatus } from "../enums/TaskStatus";
import { TaskSubmitType } from "../enums/TaskSubmitType";
import { useTaskOuterContext } from "../hooks/useTaskOuterContext";
import { Task } from "../models/Task";
import { TaskHooks, taskReducer } from "../reducers/taskReducer";
import { claimTask } from "../services/claimTask";
import { getMyNextTask } from "../services/getMyNextTask";
import { getTasks } from "../services/getTasks";
import { submitTask } from "../services/submitTask";

function TaskInnerProvider<T = any>({
	children,
	schema,
}: {
	children: React.ReactNode;
	schema: any;
	isCanceling?: (values: { task: Task; data: T }) => boolean;
}) {
	const router = useRouter();
	const { identity } = useLoggedInUser();

	const { task } = useTaskOuterContext();

	const [message, setMessage] = useState<React.ReactElement | string | null>(
		null,
	);
	const [nextStepData, setNextStepData] = useState<Task[]>([]);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isCompleted, setIsCompleted] = useState<boolean>(false);

	const [details, dispatch] = useReducer(taskReducer, {
		hooks: new TaskHooks(),
		options: {
			submitBtn: true,
		},
	});

	const statusRef = useRef<{
		status: TaskSubmitType;
		reason?: string;
		description?: string;
	}>({ status: TaskSubmitType.Complete });

	const handleChangeToCancel = useCallback(
		({ reason, description }: { reason: string; description?: string }) => {
			statusRef.current = {
				status: TaskSubmitType.Cancel,
				reason,
				description,
			};
		},
		[],
	);

	const formRef = useRef<HTMLFormElement>(null);
	const saveBtn = useRef<HTMLButtonElement>(null);

	const form = useForm({
		defaultValues: (() => {
			if (task.status === TaskStatus.Done) {
				return task.parameters ?? {};
			}

			const formData: ObjectType = {};
			getObjectKeys(schema.keyof().Values).forEach((k) => {
				formData[k] = task.data[k];
			});

			return formData;
		})(),
	});

	const {
		formState,
		handleSubmit: onFormSubmit,
		reset,
		setError,
		watch,
	} = form;

	const { errors, isSubmitting, isSubmitSuccessful } = formState;

	const fields = watch();

	async function handleSubmit(values: ObjectType) {
		try {
			statusRef.current = { status: TaskSubmitType.Complete };

			await Promise.all(
				details.hooks
					.get("pre-submit")
					.map((hook) => hook.delegate({ task, data: values })),
			);

			await submitTask({
				instanceId: task.instanceId,
				taskId: task.taskId,
				taskKey: task.key,
				data: values,
				...statusRef.current,
			});

			setIsCompleted(true);
			setMessage(<Loading size="xs">در حال پردازش اطلاعات...</Loading>);

			await Promise.all(
				details.hooks
					.get("submit")
					.map((hook) => hook.delegate({ task, data: values })),
			).catch((err) => {
				console.error("Hook (submit): ", err);
			});

			const [userNextTask, nextTasks] = await Promise.all([
				getMyNextTask(task.instanceId),
				getTasks({
					filters: {
						processInstanceId: task.instanceId,
						assignee: { $ne: identity.id },
						status: "todo",
					},
				}),
			]);

			const othersNextTasks = nextTasks.filter(
				(nextTask) => nextTask.id !== userNextTask?.id,
			);

			if (othersNextTasks.length !== 0) {
				await Promise.all(
					othersNextTasks.map(async (nextTask) => {
						const userIds: string[] = [];
						const groupNames: string[] = [];

						if (nextTask.userId && !userIds.includes(nextTask.userId)) {
							userIds.push(nextTask.userId);
						} else if (nextTask.groups.length !== 0) {
							nextTask.groups.forEach(
								(groupName) =>
									!groupNames.includes(groupName) && groupNames.push(groupName),
							);
						}

						const groups =
							groupNames.length !== 0
								? await getGroups(null, {
										filters: [{ name: "name", value: groupNames }],
									})
								: [];
						const groupIds: string[] = groups.map((x) => x.id);

						if (userIds.length !== 0 || groupIds.length !== 0) {
							const notificationResult = await PostNotifications({
								title: `کار ${nextTask.name} در ${nextTask.processName} شماره ${nextTask.caseNo} برای شما ایجاد گردید.`,
								description: " ",
								category: `task:${nextTask.taskId}`,
								users: userIds,
								groups: groupIds,
								priority: NotificationsPriority.High,
								sendNotification: true,
							});
						}
					}),
				);
			}

			if (!userNextTask) {
				setMessage("اطلاعات با موفقیت ثبت شد.");
				setNextStepData(othersNextTasks);
			} else {
				if (userNextTask.kind === "candid") {
					await claimTask(userNextTask.taskId);
				}

				setMessage(
					<Loading size="xs">
						اطلاعات با موفقیت ثبت شد. در حال انتقال...
					</Loading>,
				);
				router.push(getDynamicUrl(`/dashboard/tasks/${userNextTask.taskId}`));
			}
		} catch (err: any) {
			if (err?.message === "cancellation-confirm") {
				setError("root", {});
			} else {
				console.error(err);

				let errorMessage = "ارسال اطلاعات با خطا روبرو شد.";
				if (err?.message === "Already completed.") {
					errorMessage = "تسک مورد نظر پایان یافته است.";

					toast.loading("تا 5 ثانیه دیگر به صفحه کارهای من منتقل می‌شوید.");
					setTimeout(() => {
						router.push("/dashboard/tasks");
					}, 5000);
				} else if (err.message) {
					errorMessage = err.message;
				}

				setError("root.server", { message: errorMessage });
			}
		}
	}

	const handleSave = useCallback(
		async (values: ObjectType, options: { reset?: boolean } = {}) => {
			try {
				setIsSaving(true);

				await submitTask({
					instanceId: task.instanceId,
					taskId: task.taskId,
					taskKey: task.key,
					status: TaskSubmitType.Save,
					data: values,
				});

				if (options.reset) {
					reset({ ...values });
				}
			} catch (err: any) {
				console.error(err);
			} finally {
				setIsSaving(false);
			}
		},
		[reset, task.instanceId, task.key, task.taskId],
	);

	return (
		<>
			{message && (
				<Alert variant="info">
					<AlertDescription>{message}</AlertDescription>
				</Alert>
			)}

			{nextStepData?.length ? (
				<>
					<p>مراحل بعدی:</p>
					{nextStepData?.map((task) => (
						<li key={task?.id}>{`${task?.processName} - ${task?.name}`}</li>
					))}
				</>
			) : (
				""
			)}

			{!isCompleted && (
				<TaskInnerContext.Provider
					value={{
						...details,
						dispatch,
						save: handleSave,
						changeToCancel: handleChangeToCancel,
					}}
				>
					<Form {...form}>
						<form
							className="space-y-8"
							ref={formRef}
							onSubmit={onFormSubmit(handleSubmit)}
						>
							<fieldset
								disabled={
									isSubmitting ||
									isSubmitSuccessful ||
									task.status === TaskStatus.Done
								}
							>
								{children}
							</fieldset>

							{errors.root?.server && (
								<DestructiveAlert>
									<AlertDescription>
										{errors.root.server.message}
									</AlertDescription>
								</DestructiveAlert>
							)}

							{task.status !== TaskStatus.Done && (
								<div className="flex flex-wrap gap-3">
									{details.footer}

									{details.options.submitBtn && (
										<Button
											disabled={
												isSubmitting ||
												isSubmitSuccessful ||
												isSaving ||
												details.options.submitBtnDisabled
											}
											variant="primary"
										>
											<span>
												{getObjectKeys(fields).length ? "ثبت اطلاعات" : "ادامه"}
											</span>
											{isSubmitting && <Loading intent="white" size="xs" />}
										</Button>
									)}

									{details.options.saveBtn && (
										<Button
											ref={saveBtn}
											disabled={isSubmitting || isSubmitSuccessful || isSaving}
											type="button"
											variant="secondary"
											onClick={() => handleSave(fields)}
										>
											<span>ذخیره اطلاعات</span>
											{isSaving && <Loading size="xs" />}
										</Button>
									)}
								</div>
							)}
						</form>
					</Form>
				</TaskInnerContext.Provider>
			)}
		</>
	);
}

export { TaskInnerProvider };
