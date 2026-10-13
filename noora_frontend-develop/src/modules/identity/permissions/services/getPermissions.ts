import apiClient from "@/api/client";

import { Permission, PermissionApi } from "../models/Permission";

function parsePermission(from: PermissionApi): Permission {
	return {
		id: from.id,
		actions: from.actions,
		subject: from.subject,
		description: from.description,
		conditions: from.conditions,
	};
}

export async function getPermissions(): Promise<Permission[]> {
	const response = await apiClient.query<PermissionApi>({
		url: "permissions",
		queryOptions: {},
	});

	return response.result.data.map(parsePermission);
}
