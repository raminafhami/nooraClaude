import { ProjectStatus } from "@/projects/models/ProjectStatus";

function getActivitiesProjectDoneStatus(
	statuses: ProjectStatus[],
): ProjectStatus {
	const doneStatus = statuses.find((x) => x.order === 3);
	if (!doneStatus) throw new Error("project status 'done' is not found.");
	return doneStatus;
}

export { getActivitiesProjectDoneStatus };
