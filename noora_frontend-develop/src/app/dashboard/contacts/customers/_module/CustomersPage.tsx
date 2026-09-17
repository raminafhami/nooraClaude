"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { UserQueryFilter } from "@/identity/users/models/UserQuery";
import { UserType } from "@/identity/users/models/UserType";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import searchUserNationalCode from "@/identity/users/utils/searchUserNationalCode";
import searchUserPhoneNo from "@/identity/users/utils/searchUserPhoneNo";
import {
	CustomerRelation,
	CustomerRelationStatus,
} from "@/inspection/customers/interfaces/CustomerRelation";
import { Head } from "@/ui/Head";

import { CustomersFilter } from "./CustomersFilter";
import { CustomersTable } from "./CustomersTable";
import { UserAndRelations } from "./UserAndRelation";

const CustomerCreateDialog = dynamic(
	() => import("@/customer/components/CustomerCreateDialog"),
);

function CustomersPage() {
	const dialogs = useDialogs();

	const { identity } = useLoggedInUser();

	const [queryFilters, setQueryFilters] = useState<{
		searchTerm: string;
	}>({
		searchTerm: "",
	});

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			let filters: Partial<UserQueryFilter> = {
				type: UserType.Public,
			};

			if (
				identity.type !== UserType.System &&
				!identity.groups.includes("customers-manager")
			) {
				filters.branchId = identity.branchId;

				if (!identity.branchId) {
					filters["metadata.relations"] = {
						$elemMatch: {
							status: "active",
							$or: [{ coordinator: identity.id }, { marketer: identity.id }],
						},
					};
				}
			}

			if (queryFilters.searchTerm) {
				filters = {
					...filters,
					$or: [
						searchUserFullname(queryFilters.searchTerm),
						searchUserNationalCode(queryFilters.searchTerm),
						searchUserPhoneNo(queryFilters.searchTerm),
					],
				};
			}

			const { items: customers, total } = await getUsers({
				filters,
				pagination: { page, pageSize },
			});

			const userIds: Set<string> = new Set();
			customers.forEach((customer) => {
				const relation = customer.metadata.relations?.find(
					(x: CustomerRelation) => x.status === CustomerRelationStatus.Active,
				);

				relation?.coordinator && userIds.add(relation.coordinator);
				relation?.marketer && userIds.add(relation.marketer);
			});

			const users = await getUsers({
				filters: { _id: Array.from(userIds) },
			});

			const result: UserAndRelations[] = [];
			customers.forEach((customer) => {
				const item: UserAndRelations = {
					user: customer,
				};

				const relation = customer.metadata.relations?.find(
					(x: CustomerRelation) => x.status === CustomerRelationStatus.Active,
				);

				relation?.coordinator &&
					(item.coordinator = users.find((x) => x.id === relation.coordinator));
				relation?.marketer &&
					(item.marketer = users.find((x) => x.id === relation.marketer));

				result.push(item);
			});

			return [result, total] as [UserAndRelations[], number];
		},
		[identity, queryFilters],
	);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination<UserAndRelations>(queryFn);

	const handleCreateDialogOpen = useCallback(async () => {
		const result = await dialogs.open(CustomerCreateDialog);

		if (result) {
			refetch();
		}
	}, [dialogs, refetch]);

	return (
		<div className="space-y-8">
			<Head.Root>
				<Head.Title>لیست مشتریان</Head.Title>
				<Head.Nav className="sm:ms-auto">
					<Button onClick={handleCreateDialogOpen} variant="primary">
						<FaPlus />
						<span>ایجاد مشتری جدید</span>
					</Button>
				</Head.Nav>
			</Head.Root>

			<Card>
				<CardContent className="space-y-6 px-0 pt-6">
					<CustomersFilter
						queryFilters={queryFilters}
						setQueryFilters={setQueryFilters}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="space-y-6 px-0 pt-6">
					<CustomersTable
						customers={items}
						loading={isLoading}
						offset={offset}
						pagination={<Pagination />}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

export { CustomersPage };
