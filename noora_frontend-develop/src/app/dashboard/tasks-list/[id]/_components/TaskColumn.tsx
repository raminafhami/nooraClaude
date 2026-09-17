import { Draggable, Droppable } from "react-beautiful-dnd";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserApi } from "@/identity/users/models/User";
import { cn } from "@/lib/utils";
import { ProjectStatus } from "@/projects/models/ProjectStatus";
import { ProjectTask } from "@/projects/models/ProjectTask";
import { extractProjectTaskAssigneeUser } from "@/projects/utils/extractProjectTaskAssigneeUser";
import { extractProjectTaskStatusId } from "@/projects/utils/extractProjectTaskStatusId";

import { TaskCard } from "./TaskCard";

interface ColumnProps {
	column: ProjectStatus;
	tasks: ProjectTask[];
	hiddenCol: string;
	statuses: ProjectStatus[];
	userId: string;
	onTaskClick: (task: ProjectTask) => void;
	onUpdateTaskProgress: (
		taskId: string,
		progress: number,
		title: string,
		status: string,
	) => void;
	onUpdateTaskStatus: (statusId: string, taskId: string) => void;
}

function TaskColumn({
	column,
	tasks,
	hiddenCol,
	statuses,
	userId,
	onTaskClick,
	onUpdateTaskProgress,
	onUpdateTaskStatus,
}: ColumnProps) {
	return (
		<Droppable key={column.id} droppableId={column.id}>
			{(provided, snapshot) => (
				<Card
					className={cn("mx-2 h-[85vh] min-w-[18rem] max-w-[18rem]", {
						"border border-blue-400 shadow-lg": snapshot.isDraggingOver,
					})}
				>
					<CardHeader className="border-b text-center">
						<CardTitle className="text-xl">{column?.name}</CardTitle>
					</CardHeader>
					<CardContent
						ref={provided.innerRef}
						{...provided.droppableProps}
						className="m-4 mx-2 h-[70vh] overflow-y-auto px-1 fade-in"
					>
						{tasks
							?.filter((task) => task.status === column.id)
							?.sort((a, b) => a.order - b.order)
							?.map((task, index) => {
								const assignee = extractProjectTaskAssigneeUser(task);
								const canDrag =
									(task.createdBy as UserApi).id === userId ||
									(task.assignee as UserApi).id === userId;

								return (
									<Draggable
										key={task.id}
										draggableId={task.id}
										index={index}
										isDragDisabled={!canDrag}
									>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
											>
												<TaskCard
													task={task}
													columnId={column.id}
													hiddenCol={hiddenCol}
													onClick={() => onTaskClick(task)}
													onProgressUpdate={() =>
														onUpdateTaskProgress(
															task.id,
															task.progress === 100 ? 0 : 100,
															task.title,
															extractProjectTaskStatusId(task),
														)
													}
													onStatusUpdate={(statusId) =>
														onUpdateTaskStatus(statusId, task.id)
													}
													statuses={statuses}
													assignee={assignee}
												/>
											</div>
										)}
									</Draggable>
								);
							})}
						{provided.placeholder}
					</CardContent>
				</Card>
			)}
		</Droppable>
	);
}

export { TaskColumn };
