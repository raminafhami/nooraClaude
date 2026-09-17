"use client";

import { useCallback, useState } from "react";

import { usePagination } from "@/components/ui/pagination/usePagination";
import { UserStatus } from "@/identity/users/enums/UserStatus";
import { User } from "@/identity/users/models/User";
import { UserQueryFilter } from "@/identity/users/models/UserQuery";
import { UserType } from "@/identity/users/models/UserType";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import searchUserNationalCode from "@/identity/users/utils/searchUserNationalCode";
import searchUserPhoneNo from "@/identity/users/utils/searchUserPhoneNo";

import { UsersFilter } from "./UsersFilter";
import { UsersTable } from "./UsersTable";

export function UsersWidget() {
	const [queryFilters, setQueryFilters] = useState<{
		searchTerm: string;
		type: UserType | null;
		status: UserStatus | null;
	}>({
		searchTerm: "",
		type: null,
		status: null,
	});

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			let filters: Partial<UserQueryFilter> = {
				$and: [{ type: { $ne: UserType.System } }],
			};

			if (queryFilters.searchTerm) {
				filters.$or = [
					searchUserFullname(queryFilters.searchTerm),
					searchUserNationalCode(queryFilters.searchTerm),
					searchUserPhoneNo(queryFilters.searchTerm),
				];
			}

			if (queryFilters.type) {
				filters.type = queryFilters.type;
			}

			if (queryFilters.status) {
				filters.isActive = queryFilters.status === UserStatus.Active;
			}

			const users = await getUsers({
				filters,
				pagination: { page, pageSize },
			});

			return [users.items, users.total] as [User[], number];
		},
		[queryFilters.searchTerm, queryFilters.type, queryFilters.status],
	);

	const { items, isLoading, error, offset, page, refetch, Pagination } =
		usePagination(queryFn);

	const handleChange = useCallback(() => {
		refetch(page);
	}, [page, refetch]);

	return (
		<div className="space-y-6">
			<UsersFilter
				queryFilters={queryFilters}
				setQueryFilters={setQueryFilters}
			/>
			<UsersTable
				items={items}
				isLoading={isLoading}
				error={error}
				offset={offset}
				onChange={handleChange}
			/>
			<Pagination />
		</div>
	);
}
