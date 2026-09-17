import { UserApi } from "@/identity/users/models/User";

import { ProjectTask } from "../models/ProjectTask";

function extractProjectTaskAssigneeUser({
	assignee,
}: ProjectTask): UserApi | undefined {
	if (typeof assignee !== "object") return;
	return assignee;
}

export { extractProjectTaskAssigneeUser };
