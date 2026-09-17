import { useCallback, useEffect, useState } from "react";

import { useTableStore } from "@/cache/store/tableStore";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { InstanceQueryFilter } from "@/felo/instances/models/InstanceQuery";
import { getMyInstances } from "@/felo/instances/services/getMyInstances";
import { getTasks } from "@/felo/tasks/services/getTasks";
import { UserGroup } from "@/identity/groups/models/Group";
import { getGroups } from "@/identity/groups/services/getGroups";
import { User } from "@/identity/users/models/User";
import { getUsers } from "@/identity/users/services/getUsers";

import ApplicationsList from "./ApplicationsList";
import { ApplicationsStats } from "./ApplicationsStats";
import { Application } from "./models/Application";
import { ApplicationQuery } from "./models/ApplicationQuery";

function ApplicationsPage() {
	const { setTableData, getTableData } = useTableStore();

	const [query, setQuery] = useState<ApplicationQuery>(
		getTableData("ApplicationHistory")?.filters ?? {},
	);

	const handleQueryUpdate = useCallback((query: ApplicationQuery) => {
		setQuery({ ...query });
	}, []);

	const handleApplicationsLoad = useCallback(
		async (
			page: number,
			pageSize: number,
		): Promise<[Application[], number]> => {
			const filters: InstanceQueryFilter[] = [];

			if (query && Object.keys(query).length) {
				if (query.caseNo) {
					filters.push({
						name: "$or",
						value: [
							{
								caseNo: query.caseNo,
							},
							{
								"parameters.InspectionCaseNo": query.caseNo,
							},
							{
								"parameters.CaseItems": {
									$elemMatch: {
										caseNo: query.caseNo,
									},
								},
							},
							{
								processDefinitionKey: "Financial_Invoice_Payment",
								"parameters.InvoiceItems": {
									$elemMatch: {
										$or: [
											{ invoiceNo: query.caseNo },
											{ issueNo: query.caseNo },
											{ caseNos: query.caseNo },
										],
									},
								},
							},
							{
								"parameters.RelatedInspectionCaseNo": {
									$regex: query.caseNo,
								},
							},
						],
					});
				}

				if (query.processDefinitionKey) {
					filters.push({
						name: "processDefinitionKey",
						value: query.processDefinitionKey,
						// value: {
						//   $regex: query.processDefinitionKey,
						//   $options: "i",
						// },
					});
				}
			}

			const instances = await getMyInstances({
				filters,
				sort: { updatedAt: "desc" },
				page: {
					no: page,
					size: pageSize,
				},
				props: [
					"Assignees",
					"InspectionMethod",
					"CaseItems",
					"InvoiceItems",
					"InspectionCaseNo",
					"RelatedInspectionCaseNo",
					"Buyer",
					"BuyerName",
					"CustomName",
				],
				populate: ["holdBy"],
			});

			const tasks = await getTasks({
				filters: {
					processInstanceId: instances.items.map((x) => x.id),
					// status: "todo",
				},
			});

			const assigneeIds = Array.from(
				new Set(tasks.filter((x) => x.userId).map((x) => x.userId as string)),
			);
			const userPhoneNos = Array.from(new Set(tasks.flatMap((x) => x.users)));
			const groupIds = Array.from(new Set(tasks.flatMap((x) => x.groups)));

			const [assignees, users, groups] = await Promise.all([
				loadTasksAssignees(assigneeIds),
				loadTasksUsers(userPhoneNos),
				loadTasksGroups(groupIds),
			]);

			const applications: Application[] = instances.items.map((instance) => ({
				instance,
				tasks: tasks
					.filter((x) => x.instanceId === instance.id)
					.map((task) => ({
						task,
						assigneeName: assignees.find((x) => x.id === task.userId)?.fullname,
						userNames: task.users
							.map((x) => users.find((y) => y.phoneNo === x)?.fullname)
							.filter((x) => x) as string[],
						groupNames: task.groups
							.map((x) => groups.find((y) => y.name === x)?.title)
							.filter((x) => x) as string[],
					})),
			}));

			return [applications, instances.total];
		},
		[query],
	);

	const {
		error,
		isLoading,
		items: applications,
		offset,
		page,
		pageSize,
		Pagination: ApplicationsPagination,
	} = usePagination<Application>(
		handleApplicationsLoad,
		getTableData("ApplicationHistory")?.page,
		getTableData("ApplicationHistory")?.size,
	);

	useEffect(() => {
		setTableData({
			tableName: "ApplicationHistory",
			page: page,
			size: pageSize,
			data: applications,
			filters: query,
		});
	}, [applications, page, pageSize, query, setTableData]);

	return (
		<>
			<div className="space-y-6">
				<ApplicationsStats applications={applications} />
				<ApplicationsList
					error={error ?? ""}
					isLoading={isLoading}
					offset={offset}
					applications={applications}
					ApplicationsPagination={ApplicationsPagination}
					handleQueryUpdate={handleQueryUpdate}
				/>
			</div>
		</>
	);
}

async function loadTasksAssignees(ids: string[]): Promise<User[]> {
	const users = await getUsers({
		filters: { _id: ids },
	});

	return users;
}

async function loadTasksUsers(phoneNos: string[]): Promise<User[]> {
	const users = await getUsers({
		filters: { phoneNo: phoneNos },
	});

	return users;
}

async function loadTasksGroups(ids: string[]): Promise<UserGroup[]> {
	const groups = await getGroups(null, {
		filters: [{ name: "name", value: ids }],
	});

	return groups;
}

export { ApplicationsPage };
