import { ProjectStatus } from "@/projects/models/ProjectStatus";

function getActivitiesProjectTodoStatus(
	statuses: ProjectStatus[],
): ProjectStatus {
	const todoStatus = statuses.find((x) => x.order === 1);
	if (!todoStatus) throw new Error("project status 'todo' is not found.");
	return todoStatus;
}

export { getActivitiesProjectTodoStatus };
