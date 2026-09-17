// we have 2 userGroup one of it should be delete

import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";
import { UserGroupApi } from "@/identity/groups/models/Group";

import {
	UserGroupBaseQuery,
	UserGroupPageQuery,
	UserGroupQuery,
} from "../models/UserGroupss";

async function getUserGroups(
	options?: UserGroupBaseQuery,
): Promise<UserGroupApi[]>;

async function getUserGroups(
	options: UserGroupPageQuery,
): Promise<EntityPageResult<UserGroupApi>>;

async function getUserGroups(
	options: UserGroupQuery = {},
): Promise<UserGroupApi[] | EntityPageResult<UserGroupApi>> {
	const response = await apiClient.query<UserGroupApi>({
		url: "/user-groups",
		queryOptions: options,
	});

	if (!options.pagination) {
		return response.result.data;
	}

	return {
		items: response.result.data,
		page: options.pagination.page,
		pageSize: options.pagination.pageSize,
		total: response.result.count,
	};
}

export { getUserGroups };
