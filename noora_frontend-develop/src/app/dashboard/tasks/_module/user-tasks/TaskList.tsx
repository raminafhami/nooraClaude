"use client";

import { useCallback, useEffect, useState } from "react";

import { EntityQueryFilter } from "@/api/models/EntityQuery";
import { useTableStore } from "@/cache/store/tableStore";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { TaskStatus } from "@/felo/tasks/enums/TaskStatus";
import { Task } from "@/felo/tasks/models/Task";
import {
	TaskPageQuery,
	TaskQueryFilterParam,
} from "@/felo/tasks/models/TaskQuery";
import { getMyTasks } from "@/felo/tasks/services/getMyTasks";
import { getMyTasksByStatus } from "@/felo/tasks/services/getMyTasksByStatus";
import { useSocket } from "@/socket/useSocket";

import { TasksFilter } from "./TaskFilters";
import TaskTable from "./TaskTable";

function TaskList() {
	const { tasksSocket } = useSocket();

	const { setTableData, getTableData } = useTableStore();

	const [queryFilters, setQueryFilters] = useState<{
		caseNo: string;
		status: TaskStatus;
		processDefinitionKey: string | null;
	}>(
		(getTableData("TasksList")?.filters as any) ?? {
			caseNo: "",
			status: TaskStatus.Todo,
			processDefinitionKey: null,
		},
	);

	const handleTasksLoad = useCallback(
		async (page: number, pageSize: number): Promise<[Task[], number]> => {
			const filters: Partial<EntityQueryFilter<TaskQueryFilterParam>> = {};

			if (queryFilters.caseNo) {
				filters.$or = [
					{
						caseNo: { $regex: queryFilters.caseNo },
					},
					{
						$and: [
							{
								processDefinitionKey: "Inspectors",
							},
							{
								data: {
									$elemMatch: {
										key: "InspectionCaseNo",
										value: { $regex: queryFilters.caseNo },
									},
								},
							},
						],
					},
					{
						processDefinitionKey: "Financial_Invoice_Payment",
						data: {
							$elemMatch: {
								key: "InvoiceItems",
								value: {
									$elemMatch: {
										$or: [
											{ invoiceNo: queryFilters.caseNo },
											{ issueNo: queryFilters.caseNo },
											{ caseNos: queryFilters.caseNo },
										],
									},
								},
							},
						},
					},
				];
			}

			if (queryFilters.processDefinitionKey) {
				filters.processDefinitionKey = queryFilters.processDefinitionKey;
			}

			const options: TaskPageQuery = {
				filters,
				pagination: {
					page,
					pageSize,
				},
			};

			const result = (
				queryFilters.status === TaskStatus.Todo
					? await getMyTasks(options)
					: await getMyTasksByStatus(queryFilters.status, options)
			) as any;

			return [result.items, result.total];
		},
		[queryFilters],
	);

	const {
		error,
		isLoading,
		items: tasks,
		offset,
		page,
		pageSize,
		refetch,
		Pagination,
	} = usePagination<Task>(
		handleTasksLoad,
		getTableData("TasksList")?.page,
		getTableData("TasksList")?.size,
	);

	useEffect(() => {
		setTableData({
			tableName: "TasksList",
			page: page,
			size: pageSize,
			data: tasks,
			filters: queryFilters,
		});
	}, [queryFilters, page, pageSize, setTableData, tasks]);

	const handleChange = useCallback(
		(hold?: boolean) => {
			refetch(hold ? pageSize : undefined);
		},
		[pageSize, refetch],
	);

	useEffect(() => {
		if (!tasksSocket) return;

		const handleNewTask = () => {
			refetch();
		};
		tasksSocket.on("newTask", handleNewTask);

		return () => {
			tasksSocket.off("newTask", handleNewTask);
		};
	}, [refetch, tasksSocket]);

	return (
		<div className="space-y-10">
			<TasksFilter
				queryFilters={queryFilters}
				setQueryFilters={setQueryFilters}
			/>

			<div className="space-y-6">
				<TaskTable
					tasks={tasks}
					loading={isLoading}
					error={error}
					offset={offset}
					onChange={handleChange}
				/>

				<Pagination />
			</div>
		</div>
	);
}

export default TaskList;
