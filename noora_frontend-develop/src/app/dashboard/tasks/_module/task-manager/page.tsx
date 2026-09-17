"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import GetAllProjects from "@/api/tasks-manager/getAllProjects";
import GetAllProjectsTasksLabels from "@/api/tasks-manager/getAllProjectsTasksLabels";
import GetProjectTasks from "@/api/tasks-manager/getProjectTasks";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { useTableData } from "@/cache/tableHook";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pagination from "@/components/ui/pagination/Pagination";

import { TasksList } from "./TasksList";

export default function TasksListPage() {
	const [tasks, setTasks] = useState<any>([]);
	const [items, setItems] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [data, setData] = useState<any>([]);
	const [projectLabels, setProjectLabels] = useState<any>([]);

	const {
		currentPage,
		setCurrentPage,
		size,
		setSize,
		searchAttribute,
		setSearchAttribute,
	} = useTableData({
		tableName: "TaskManagerTasks",
		initialPage: 0,
		initialSize: 10,
		initialFilters: undefined,
		data: data,
	});

	const { identity } = useLoggedInUser();

	async function getAllProjects() {
		setLoading(true);
		try {
			const res = await GetAllProjects({
				page: 0,
				size: Number.MAX_SAFE_INTEGER, //handle with pagination
			});

			if (!res || !res.result?.data) return;

			setData(res.result.data);
		} catch (e) {
			console.error(e);
			toast.error("خطایی رخ داد!");
		} finally {
			setLoading(false);
		}
	}

	const getAllTasks = useCallback(async () => {
		setLoading(true);
		let filterByProjectName = searchAttribute?.filterByStatus
			? searchAttribute?.filterByStatus?.id
			: undefined;
		let filterByLabel = searchAttribute?.filterByLabel
			? searchAttribute?.filterByLabel?.id
			: undefined;

		try {
			const res = await GetProjectTasks({
				page: currentPage,
				size: size,
				filterByLabel,
				filterByProjectName,
				filterByUser: identity?.id,
			});

			if (res?.result?.data) {
				setTasks(res.result.data);
				setItems(res.result.count);
			}
		} catch (e) {
			console.error(e);
			toast.error("خطایی رخ داد!");
		} finally {
			setLoading(false);
		}
	}, [currentPage, identity?.id, searchAttribute, size]);

	async function getProjectLabel() {
		setLoading(true);

		try {
			const res = await GetAllProjectsTasksLabels({
				page: 0,
				size: Number.MAX_SAFE_INTEGER, // Handle with pagination if needed
			});

			if (res?.result?.data) {
				setProjectLabels(res.result.data);
			}
		} catch (err) {
			console.error(err);
			toast.error("خطایی رخ داد!");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getAllTasks();
	}, [searchAttribute, currentPage, getAllTasks]);

	useEffect(() => {
		getProjectLabel();
		getAllProjects();
	}, []);

	return (
		<>
			<div className="space-y-6">
				<div className="flex items-center gap-x-4">
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button>
								{searchAttribute?.filterByLabel?.title ?? "فیلتر دسته بندی"}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							{searchAttribute?.filterByLabel && (
								<DropdownMenuItem
									className="cursor-pointer justify-end"
									key="undefined"
									onClick={() => {
										setSearchAttribute((prev) => ({
											...prev,
											filterByLabel: undefined,
										}));
									}}
								>
									همه
								</DropdownMenuItem>
							)}
							{projectLabels?.map((label: any, i: number) => (
								<DropdownMenuItem
									className="cursor-pointer justify-end"
									key={i}
									onClick={() => {
										setSearchAttribute((prev) => ({
											...prev,
											filterByLabel: label,
										}));
									}}
								>
									{label?.title}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button>
								{searchAttribute?.filterByStatus?.name ?? "فیلتر بر اساس پروژه"}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							{searchAttribute?.filterByStatus && (
								<DropdownMenuItem
									className="cursor-pointer justify-end"
									key="undefined"
									onClick={() => {
										setSearchAttribute((prev) => ({
											...prev,
											filterByStatus: undefined,
										}));
									}}
								>
									همه
								</DropdownMenuItem>
							)}
							{data?.map((status: any, i: number) => (
								<DropdownMenuItem
									className="cursor-pointer justify-end"
									key={i}
									onClick={() => {
										setSearchAttribute((prev) => ({
											...prev,
											filterByStatus: status,
										}));
									}}
								>
									<p>{status?.name}</p>
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{searchAttribute && (
						<Button
							type="button"
							onClick={() => setSearchAttribute(undefined)}
							className="mx-1 flex cursor-pointer select-none items-center rounded-md px-4 py-2"
						>
							حذف همه فیلترها
						</Button>
					)}
				</div>

				<TasksList loading={loading} tasks={tasks} />

				<Pagination
					items={items}
					currentPage={currentPage}
					size={size}
					onPageChange={setCurrentPage}
					loading={loading}
					setSize={setSize}
				/>
			</div>
		</>
	);
}
