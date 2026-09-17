import { UserApi } from "@/identity/users/models/User";

import { Project } from "../models/Project";

function extractProjectMembers({ members }: Project): UserApi[] | undefined {
	if (members.length < 1) return [];

	if (typeof members[0] !== "object") return;

	return members as UserApi[];
}

export { extractProjectMembers };
