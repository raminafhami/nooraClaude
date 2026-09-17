import { Project } from "../models/Project";
import { ProjectStatus } from "../models/ProjectStatus";

function getProjectStatuses(
	project: Pick<Project, "statuses"> | null | undefined,
): ProjectStatus[] | undefined {
	if (!project) return;

	if (typeof project.statuses.at(0) !== "object") {
		throw new TypeError("the project statuses isn't an object array.");
	}

	return project.statuses as ProjectStatus[];
}

export { getProjectStatuses };
