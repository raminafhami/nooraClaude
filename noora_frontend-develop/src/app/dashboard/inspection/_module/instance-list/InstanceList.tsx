"use client";

import { useCallback, useEffect, useState } from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { useTableStore } from "@/cache/store/tableStore";
import { Card, CardContent } from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { InstanceQueryFilter } from "@/felo/instances/models/InstanceQuery";
import { getInstances } from "@/felo/instances/services/getInstances";
import { getTasks } from "@/felo/tasks/services/getTasks";
import { UserGroup } from "@/identity/groups/models/Group";
import { getGroups } from "@/identity/groups/services/getGroups";
import { User } from "@/identity/users/models/User";
import { getUsers } from "@/identity/users/services/getUsers";
import { ObjectType } from "@/utils/object/ObjectType";

import { InstanceFilter } from "./InstanceFilter";
import { InstanceFilterArgs, InstanceItemType } from "./InstanceList.types";
import { InstanceTable } from "./InstanceTable";

const INSPECTION_INSTANCE_LIST_CACHE_KEY = "InspectionInstanceList";

function InstanceList() {
	const { identity } = useLoggedInUser();

	const { setTableData, getTableData } = useTableStore();
	const cachedData = getTableData(INSPECTION_INSTANCE_LIST_CACHE_KEY);

	const [filterArgs, setFilterArgs] = useState<InstanceFilterArgs>(
		cachedData?.filters ?? {},
	);

	const fetchInspectionInstances = useCallback(
		async (
			page: number,
			pageSize: number,
		): Promise<[InstanceItemType[], number]> => {
			const filters: InstanceQueryFilter[] = [];

			const $andFilter: ObjectType[] = [
				{
					$or: [
						{ processDefinitionKey: { $regex: `^Inspection_Case` } },
						{ processDefinitionKey: { $regex: `Sampling$` } },
					],
				},
			];

			filters.push({ name: "$and", value: $andFilter });

			if (identity.branchId) {
				$andFilter.push({
					$or: [
						{ "parameters.Branch.id": identity.branchId },
						{ "parameters.BranchId": identity.branchId },
					],
				});
			} else if (filterArgs.branchId) {
				$andFilter.push({
					$or:
						filterArgs.branchId === "headquarters"
							? [
									{
										$and: [
											{ "parameters.Branch": { $exists: true } },
											{
												"parameters.Branch.id": null,
											},
										],
									},
									{
										$and: [
											{ "parameters.BranchId": { $exists: true } },
											{ "parameters.BranchId": null },
										],
									},
								]
							: [
									{
										"parameters.Branch.id": filterArgs.branchId,
									},
									{
										"parameters.BranchId": filterArgs.branchId,
									},
								],
				});
			}

			if (filterArgs.caseNo) {
				filters.push({ name: "caseNo", value: { $regex: filterArgs.caseNo } });
			}

			if (filterArgs.processDefinitionKey) {
				filters.push({
					name: "processDefinitionKey",
					value: filterArgs.processDefinitionKey,
				});
			}

			if (filterArgs.status) {
				filters.push({ name: "status", value: filterArgs.status });
			}

			if (filterArgs.contractNo) {
				filters.push({
					name: "contractNo",
					value: { $regex: filterArgs.contractNo },
				});
			}

			const instances = await getInstances({
				filters,
				sort: { createdAt: "desc" },
				page: { no: page, size: pageSize },
				populate: ["holdBy", "cancelledBy"],
				props: [
					"Assignees",
					"InspectionMethod",
					"InvoicePaymentStatus",
					"Buyer",
					"BuyerName",
					"CustomName",
				],
			});

			const tasks = await getTasks({
				filters: {
					processInstanceId: instances.items.map((x) => x.id),
					status: "todo",
				},
			});

			const assigneeIds = Array.from(
				new Set(tasks.filter((x) => x.userId).map((x) => x.userId as string)),
			);
			const userPhoneNos = Array.from(new Set(tasks.flatMap((x) => x.users)));
			const groupIds = Array.from(new Set(tasks.flatMap((x) => x.groups)));

			const [assignees, users, groups] = await Promise.all([
				fetchTasksAssignees(assigneeIds),
				fetchTasksUsers(userPhoneNos),
				fetchTasksGroups(groupIds),
			]);

			const applications: InstanceItemType[] = instances.items.map(
				(instance) => ({
					instance,
					tasks: tasks
						.filter((x) => x.instanceId === instance.id)
						.map((task) => ({
							task,
							assigneeName: assignees.find((x) => x.id === task.userId)
								?.fullname,
							userNames: task.users
								.map((x) => users.find((y) => y.phoneNo === x)?.fullname)
								.filter((x) => x) as string[],
							groupNames: task.groups
								.map((x) => groups.find((y) => y.name === x)?.title)
								.filter((x) => x) as string[],
						})),
				}),
			);

			return [applications, instances.total];
		},
		[identity, filterArgs],
	);

	const { error, isLoading, items, offset, page, pageSize, Pagination } =
		usePagination<InstanceItemType>(
			fetchInspectionInstances,
			cachedData?.page,
			cachedData?.size,
		);

	useEffect(() => {
		setTableData({
			tableName: INSPECTION_INSTANCE_LIST_CACHE_KEY,
			page: page,
			size: pageSize,
			data: items,
			filters: filterArgs,
		});
	}, [items, page, pageSize, filterArgs, setTableData]);

	return (
		<>
			<Card>
				<CardContent className="px-0 pt-6">
					<InstanceFilter
						filterArgs={filterArgs}
						onFilterArgsUpdate={setFilterArgs}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="px-0 pt-6">
					<InstanceTable
						error={error}
						items={items}
						loading={isLoading}
						offset={offset}
						pagination={<Pagination />}
					/>
				</CardContent>
			</Card>
		</>
	);
}

async function fetchTasksAssignees(ids: string[]): Promise<User[]> {
	const users = await getUsers({
		filters: { _id: ids },
	});

	return users;
}

async function fetchTasksUsers(phoneNos: string[]): Promise<User[]> {
	const users = await getUsers({
		filters: { phoneNo: phoneNos },
	});

	return users;
}

async function fetchTasksGroups(ids: string[]): Promise<UserGroup[]> {
	const groups = await getGroups(null, {
		filters: [{ name: "name", value: ids }],
	});

	return groups;
}

export default InstanceList;
