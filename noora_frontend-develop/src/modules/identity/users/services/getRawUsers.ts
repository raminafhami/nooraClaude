import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import { UserApi } from "../models/User";
import { UserBaseQuery, UserPagedQuery, UserQuery } from "../models/UserQuery";

export async function getRawUsers(
	options?: Partial<UserBaseQuery>,
): Promise<UserApi[]>;
export async function getRawUsers(
	options?: Partial<UserPagedQuery>,
): Promise<PagedResult<UserApi>>;
export async function getRawUsers(
	options: UserQuery = {},
): Promise<UserApi[] | PagedResult<UserApi>> {
	let page: number = options.pagination?.page ?? 0;
	let pageSize: number =
		options.pagination?.pageSize ?? Number.MAX_SAFE_INTEGER;

	const searchParams = new URLSearchParams();
	searchParams.append("page", page.toString());
	searchParams.append("size", pageSize.toString());
	options.filters &&
		searchParams.append("filters", JSON.stringify(options.filters));
	options.sort && searchParams.append("sort", JSON.stringify(options.sort));
	options.populate &&
		searchParams.append("populate", options.populate.join(" "));
	options.projection &&
		searchParams.append("projection", options.projection.join(" "));

	const response = await apiClient.get<PagedResultApiModel<UserApi>>({
		url: `/users?${searchParams.toString()}`,
	});

	if (!options.pagination) {
		return response.result.data;
	}

	return new PagedResult(
		response.result.data,
		page,
		pageSize,
		response.result.count,
	);
}
