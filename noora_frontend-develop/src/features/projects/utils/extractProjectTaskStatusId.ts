import { ProjectTask } from "../models/ProjectTask";

function extractProjectTaskStatusId({ status }: ProjectTask): string {
	return typeof status === "object" ? status.id : status;
}

export { extractProjectTaskStatusId };
