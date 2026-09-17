"use client";

import { useCallback } from "react";
import { FaList } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardTitle,
} from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { ContractNumber } from "@/contract-number/models/ContractNumber";
import { InstanceQueryFilter } from "@/felo/instances/models/InstanceQuery";
import { getInstances } from "@/felo/instances/services/getInstances";
import { getTasks } from "@/felo/tasks/services/getTasks";
import { UserGroup } from "@/identity/groups/models/Group";
import { getGroups } from "@/identity/groups/services/getGroups";
import { User } from "@/identity/users/models/User";
import { getUsers } from "@/identity/users/services/getUsers";
import { ObjectType } from "@/utils/object/ObjectType";

import { InstanceItemType } from "../../../_module/instance-list/InstanceList.types";
import { InstanceTable } from "../../../_module/instance-list/InstanceTable";

function ContractInstanceList({
	contract,
}: {
	contract: ContractNumber | undefined;
}) {
	const { identity } = useLoggedInUser();

	const fetchData = useCallback(
		async (page: number, pageSize: number) => {
			if (!contract?.cn) return [[], 0] as [InstanceItemType[], number];

			const filters: InstanceQueryFilter[] = [
				{
					name: "contractNo",
					value: { $regex: contract.cn },
				},
			];

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

			return [applications, instances.total] as const;
		},
		[contract?.cn, identity.branchId],
	);

	const { items, isLoading, offset, Pagination, refetch, error } =
		usePagination(fetchData);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<CardIcon>
						<FaList />
					</CardIcon>
					درخواست ها
				</CardTitle>
			</CardHeader>
			<CardContent className="px-0">
				<InstanceTable
					error={error}
					items={items}
					loading={isLoading}
					offset={offset}
					pagination={<Pagination />}
				/>
			</CardContent>
		</Card>
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

export { ContractInstanceList };
