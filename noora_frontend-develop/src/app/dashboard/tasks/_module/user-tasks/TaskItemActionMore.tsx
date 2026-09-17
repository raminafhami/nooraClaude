"use client";

import { useCallback, useState } from "react";
import { FaEllipsis, FaPause, FaPlay } from "react-icons/fa6";
import { toast } from "sonner";

import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { TableAction } from "@/components/ui/table";
import { TaskHoldDialog } from "@/felo/tasks/components/TaskHoldDialog";
import { TaskKind } from "@/felo/tasks/enums/TaskKind";
import { TaskStatus } from "@/felo/tasks/enums/TaskStatus";
import { TaskSubmitType } from "@/felo/tasks/enums/TaskSubmitType";
import { Task } from "@/felo/tasks/models/Task";
import { submitTask } from "@/felo/tasks/services/submitTask";

function TaskItemActionMore({
	task,
	onChange,
}: {
	task: Task;
	onChange: () => void;
}) {
	const canChangeStatus =
		(task.status === TaskStatus.Todo && task.kind === TaskKind.Pending) ||
		task.status === TaskStatus.OnHold;

	if (!canChangeStatus) {
		return null;
	}

	return (
		<TableAction>
			<DropdownMenu>
				<DropdownMenuTrigger className="h-4">
					<FaEllipsis />
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-44" side="left">
					{canChangeStatus && (
						<TaskPauseOrResumeMenuItem
							key={task.status}
							task={task}
							onChange={onChange}
						/>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</TableAction>
	);
}

function TaskPauseOrResumeMenuItem({
	task,
	onChange,
}: {
	task: Task;
	onChange: () => void;
}) {
	const dialogs = useDialogs();

	const [isPending, setIsPending] = useState<boolean>(false);
	const [isComplete, setIsComplete] = useState<boolean>(false);

	const isTaskInProgress = task.status === TaskStatus.Todo;

	const pauseTask = useCallback(async () => {
		try {
			setIsPending(true);

			const result = await dialogs.open(TaskHoldDialog, { task });

			if (result) {
				setIsComplete(true);
				onChange();
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsPending(false);
		}
	}, [task, dialogs, onChange]);

	const resumeTask = useCallback(async () => {
		if (isPending) return;

		try {
			setIsPending(true);

			await submitTask({
				instanceId: task.instanceId,
				taskId: task.taskId,
				taskKey: task.key,
				status: TaskSubmitType.Resume,
				data: {},
			});

			toast.success("کار مورد نظر با موفقیت در جریان کار قرار گرفت.");

			setIsComplete(true);
			onChange();
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام تغییر وضعیت کار رخ داد.");
		} finally {
			setIsPending(false);
		}
	}, [isPending, task.instanceId, task.key, task.taskId, onChange]);

	return (
		<DropdownMenuItem
			className="flex items-center gap-2"
			disabled={isPending || isComplete}
			onSelect={async (event) => {
				event.preventDefault();

				if (isTaskInProgress) {
					pauseTask();
				} else if (task.status === TaskStatus.OnHold) {
					resumeTask();
				}
			}}
		>
			<Spinner loading={isPending} size="xs">
				{isTaskInProgress ? <FaPause /> : <FaPlay />}
			</Spinner>
			<span>{isTaskInProgress ? "توقف کار" : "ادامه کار"}</span>
		</DropdownMenuItem>
	);
}

export { TaskItemActionMore };
