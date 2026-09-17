"use client";
import { useCallback, useState } from "react";
import { DragDropContext, DragUpdate, DropResult } from "react-beautiful-dnd";
import { toast } from "sonner";

import PatchProjectTask from "@/api/tasks-manager/patchProjectTask";
import PatchProjectTaskStatus from "@/api/tasks-manager/patchProjectTaskStatus";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { useDragDrop } from "@/dragdrop/useDragDrop";
import { Project } from "@/projects/models/Project";
import { ProjectTask } from "@/projects/models/ProjectTask";
import { getProjectStatuses } from "@/projects/utils/getProjectStatuses";

import TaskDrawer from "./modules/TaskDrawer";
import { TaskColumn } from "./TaskColumn";

interface TaskPageProps {
	data: Project;
	loading: boolean;
	getTasks: () => void;
	setLoading: (s: boolean) => void;
	tasks: ProjectTask[];
	setTasks: React.Dispatch<React.SetStateAction<ProjectTask[]>>;
}

function TaskPage({
	data,
	setLoading,
	tasks,
	getTasks,
	setTasks,
}: TaskPageProps) {
	const [taskData, setTaskData] = useState<ProjectTask | null>(null);
	const [isModal, setIsModal] = useState<boolean>(false);
	const userId = useLoggedInUser().identity.id;

	const { onDragEnd, onDragUpdate, hiddenCol, setHiddenCol } = useDragDrop({
		items: tasks,
		itemId: "id",
		itemColumn: "status",
		itemOrder: "order",
	});

	const handleDragUpdate = useCallback(
		(update: DragUpdate) => {
			onDragUpdate(update);
		},
		[onDragUpdate],
	);

	const handleDragEnd = useCallback(
		async (result: DropResult) => {
			setHiddenCol("");
			const res = await onDragEnd(result);
			if (!res) return;

			const {
				sourceColumnId,
				destinationColumnId,
				destinationIndex,
				updatedItems,
			} = res;
			const task = tasks.find((t) => t.id === result.draggableId);
			if (!task) return;
			setTasks(updatedItems);

			await PatchProjectTask({
				id: task.id,
				order: destinationIndex + 1,
				title: tasks.find((x: ProjectTask) => x.id === task.id)?.title,
				status: destinationColumnId,
			});

			if (destinationColumnId !== sourceColumnId) {
				handleTaskStatusUpdate(destinationColumnId, task.id);
			} else {
				getTasks();
			}
		},
		[onDragEnd, setHiddenCol, tasks, setTasks, getTasks],
	);

	const statuses = getProjectStatuses(data);

	const handleTaskClick = useCallback((task: ProjectTask) => {
		setIsModal(true);
		setTaskData(task);
	}, []);

	const handleTaskProgressUpdate = useCallback(
		async (taskId: string, progress: number, title: string, status: string) => {
			setLoading(true);
			try {
				await PatchProjectTask({ id: taskId, progress, title, status });
			} catch (e) {
				toast.error("خطای نامشخصی رخ داد");
				setLoading(false);
			} finally {
				setLoading(false);
				getTasks();
			}
		},
		[setLoading, getTasks],
	);

	const handleTaskStatusUpdate = useCallback(
		async (status: string, taskId: string) => {
			setLoading(true);
			try {
				await PatchProjectTaskStatus({ status, taskId });
			} catch (e) {
				toast.error("خطای نامشخصی رخ داد");
			} finally {
				getTasks();
				setLoading(false);
			}
		},
		[setLoading, getTasks],
	);

	if (!statuses) return null;

	return (
		<>
			{isModal && (
				<TaskDrawer
					data={taskData}
					allData={data}
					isModal={isModal}
					setIsModal={setIsModal}
					getTasks={getTasks}
				/>
			)}
			<DragDropContext
				onDragEnd={handleDragEnd}
				onDragUpdate={handleDragUpdate}
			>
				<div className="flex h-full w-full flex-row overflow-x-auto overflow-y-hidden py-2">
					{statuses
						.sort((a, b) => a.order - b.order)
						.map((column) => (
							<TaskColumn
								key={column.id}
								column={column}
								tasks={tasks}
								hiddenCol={hiddenCol}
								statuses={statuses}
								userId={userId}
								onTaskClick={handleTaskClick}
								onUpdateTaskProgress={handleTaskProgressUpdate}
								onUpdateTaskStatus={handleTaskStatusUpdate}
							/>
						))}
				</div>
			</DragDropContext>
		</>
	);
}

export { TaskPage };
