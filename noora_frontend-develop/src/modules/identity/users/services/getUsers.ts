import apiClient from "@/api/client";
import { PagedResult, PagedResultApiModel } from "@/models/PagedResult";

import { User, UserApi } from "../models/User";
import { UserBaseQuery, UserPagedQuery, UserQuery } from "../models/UserQuery";
import parseUser from "../utils/parseUser";

async function getUsers(options?: Partial<UserBaseQuery>): Promise<User[]>;

async function getUsers(
	options?: Partial<UserPagedQuery>,
): Promise<PagedResult<User>>;

async function getUsers(
	options: UserQuery = {},
): Promise<User[] | PagedResult<User>> {
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
		return parseUser(response.result.data);
	}

	return new PagedResult(
		parseUser(response.result.data),
		page,
		pageSize,
		response.result.count,
	);
}

export { getUsers };
