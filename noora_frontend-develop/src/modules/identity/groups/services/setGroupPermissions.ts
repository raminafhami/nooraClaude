import apiClient from "@/api/client";

import { UserGroup, UserGroupApi } from "../models/Group";
import { parseGroup } from "../utils/parseGroup";

export async function setGroupPermissions(
	id: string,
	permissions: string[],
): Promise<UserGroup> {
	const response = await apiClient.put<UserGroupApi>({
		url: `/user-groups/${id}/set-permissions`,
		body: { permissions },
	});

	return parseGroup(response.result);
}
