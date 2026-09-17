"use client";
import moment from "moment";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FaChartPie, FaChevronDown, FaUser } from "react-icons/fa";
import { FaPlus, FaUsersLine } from "react-icons/fa6";
import { toast } from "sonner";

import GetAllProjectsTasksLabels from "@/api/tasks-manager/getAllProjectsTasksLabels";
import GetProjectById from "@/api/tasks-manager/getProjectById";
import GetProjectTasks from "@/api/tasks-manager/getProjectTasks";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Project } from "@/projects/models/Project";
import { Layout } from "@/ui/Layout";

import FullOption from "./_components/chart/FullOption";
import { TaskCreateDialog } from "./_components/task-create/TaskCreateDialog";
import { TaskPage } from "./_components/TaskPage";

interface SearchAttributeProps {
	filterByUser?: boolean;
	filterByStatus?: any;
	filterByLabel?: any;
}

export default function TaskPageComponent() {
	const [data, setData] = useState<Project>();
	const [items, setItems] = useState<Array<string>>();
	const [loading, setLoading] = useState<boolean>(false);
	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();
	const [tasks, setTasks] = useState<any>();
	const params = useParams();
	const { identity } = useLoggedInUser();

	const getProjectDetail = useCallback(async () => {
		setLoading(true);
		try {
			if (params.id) {
				let res = GetProjectById({ id: params.id as string });
				res.then((res) => {
					if (res) {
						setData(res.result);
						setLoading(false);
					}
				});
			}
		} catch (e) {
			toast.error("خطایی در دریافت دسته بندی ها رخ داد!");
			setLoading(false);
		}
	}, [params.id]);

	const countTasksWithProgress100 = () => {
		let count = 0;
		tasks?.forEach((task: any) => {
			if (task?.progress === 100) {
				count++;
			}
		});
		return (count / tasks?.length) * 100;
	};

	const countTasksWithProgress0 = () => {
		let count = 0;
		tasks?.forEach((task: any) => {
			if (task?.progress === 0) {
				count++;
			}
		});
		return (count / tasks?.length) * 100;
	};

	const countTasksWithExpiredDate = () => {
		let count = 0;
		tasks?.forEach((task: any) => {
			if (
				moment(task?.deadline).locale("fa").format("YYYY/MM/DD") <=
				moment(new Date()).locale("fa").format("YYYY/MM/DD")
			) {
				count++;
			}
		});
		return (count / tasks.length) * 100;
	};

	const countTasksWithOverdueDate = () => {
		let count = 0;
		tasks?.forEach((task: any) => {
			if (
				moment(task?.deadline).locale("fa").format("YYYY/MM/DD") >=
				moment(new Date()).locale("fa").format("YYYY/MM/DD")
			) {
				count++;
			}
		});
		return (count / tasks?.length) * 100;
	};

	const getRandomColor = () => {
		const letters = "0123456789ABCDEF";
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};

	const countTasksStatuses = () => {
		const dataArr: any = [];
		data?.statuses?.forEach((status: any) => {
			const statusId = status.id;
			const statusName = status.name;
			const count = tasks?.filter(
				(task: any) => task?.status === statusId,
			).length;
			const percentage = (count / tasks?.length) * 100;
			const color = getRandomColor(); // Call a function to generate a random color
			dataArr.push({
				title: statusName,
				value: percentage,
				key: statusId,
				color: color,
			});
		});
		return dataArr;
	};

	const getTasks = useCallback(async () => {
		try {
			let filterByUser = searchAttribute?.filterByUser
				? identity?.id
				: undefined;
			let filterByStatus = searchAttribute?.filterByStatus
				? searchAttribute?.filterByStatus?.id
				: undefined;
			let filterByLabel = searchAttribute?.filterByLabel
				? searchAttribute?.filterByLabel?.id
				: undefined;
			let res = await GetProjectTasks({
				page: 0,
				size: 99999,
				id: params.id as string,
				filterByUser,
				filterByStatus,
				filterByLabel,
			});
			if (res) {
				setTasks(res.result.data);
			}
		} catch {
			toast.error("خطایی در دریافت اطلاعات رخ داد!");
		}
	}, [
		identity?.id,
		params.id,
		searchAttribute?.filterByLabel,
		searchAttribute?.filterByStatus,
		searchAttribute?.filterByUser,
	]);

	async function getProjectLabel() {
		let res;
		try {
			res = GetAllProjectsTasksLabels({
				page: 0,
				size: 9999,
			});
			res.then((res) => {
				setItems(res.result?.data);
			});
		} catch (err) {
			toast.error("خطایی رخ داد!");
		}
	}

	useEffect(() => {
		getProjectDetail();
		getProjectLabel();
		getTasks();
	}, [getProjectDetail, getTasks]);

	useEffect(() => {
		getTasks();
	}, [getTasks, searchAttribute]);

	const [createOpen, setCreateOpen] = useState<boolean>(false);

	const handleCreateDialogOpen = useCallback(() => {
		setCreateOpen(true);
	}, []);

	const handleCreateDialogClose = useCallback(
		(result?: boolean) => {
			setCreateOpen(false);

			if (result) {
				getTasks();
			}
		},
		[getTasks],
	);

	return (
		<>
			<TaskCreateDialog
				payload={{ project: data ?? ({} as Project) }}
				open={createOpen}
				onClose={handleCreateDialogClose}
			/>

			<Layout.Root>
				<div className="select-none px-2 pt-10">
					<div className="flex w-full justify-between">
						<div className="flex flex-col">
							<div className="flex flex-wrap gap-x-3">
								<Button
									type="button"
									onClick={() =>
										setSearchAttribute((prev) => ({
											...prev,
											filterByUser: !searchAttribute?.filterByUser,
										}))
									}
								>
									<>
										{searchAttribute?.filterByUser ? (
											<>
												همه تسک ها <FaUsersLine size={20} className="mr-2" />
											</>
										) : (
											<>
												تسک های من <FaUser className="mr-2" />
											</>
										)}
									</>
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger>
										{searchAttribute?.filterByLabel?.title ?? (
											<Button>
												فیلتر دسته بندی <FaChevronDown className="mr-2" />
											</Button>
										)}
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										{searchAttribute?.filterByLabel && (
											<DropdownMenuItem
												className="cursor-pointer justify-end"
												key={"undefined"}
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
										{items?.map((label: any, i: number) => (
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
												<li dir="rtl">{label?.title}</li>
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
								<DropdownMenu>
									<DropdownMenuTrigger>
										{searchAttribute?.filterByStatus?.name ?? (
											<Button>
												فیلتر وضعیت <FaChevronDown className="mr-2" />
											</Button>
										)}
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										{searchAttribute?.filterByStatus && (
											<DropdownMenuItem
												className="cursor-pointer justify-end"
												key={"undefined"}
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
										{data?.statuses?.map((status: any, i: number) => (
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
												<li dir="rtl">{status?.name}</li>
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
								{(searchAttribute?.filterByUser === true ||
									searchAttribute?.filterByLabel !== undefined ||
									searchAttribute?.filterByStatus !== undefined) && (
									<Button
										type="button"
										onClick={() => setSearchAttribute(undefined)}
									>
										حذف همه فیلترها
									</Button>
								)}
							</div>
							<div className="scrollbar-thin relative my-2 h-full min-h-[4rem] min-w-full overflow-x-auto">
								{data?.members
									? data?.members?.map((member: any, i: number) => (
											<TooltipProvider delayDuration={100} key={member?.id}>
												<Tooltip>
													<TooltipTrigger
														style={{ right: i * 28 }}
														className={`absolute m-1 mx-[.1rem] flex h-11 w-11 scale-90 select-none items-center justify-center rounded-full bg-indigo-300 p-1 font-bold text-white ring-1 ring-white transition-all hover:z-50 hover:scale-110 hover:bg-indigo-400`}
													>
														{member?.name?.slice(0, 1)}{" "}
														{member?.lastname?.slice(0, 1)}
													</TooltipTrigger>
													<TooltipContent className="">
														<p>
															{member?.name} {member?.lastname}
														</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										))
									: ""}
							</div>
						</div>
						<div className="flex items-start gap-3">
							<Button type="button" onClick={() => handleCreateDialogOpen()}>
								<FaPlus />
								<span>افزودن تسک جدید</span>
							</Button>

							<DynamicLink href="/dashboard/tasks-list">
								<Button type="button">بازگشت</Button>
							</DynamicLink>
						</div>
					</div>
				</div>
				<Layout.Content className="select-none">
					{tasks && (
						<Sheet>
							{tasks?.length ? (
								<SheetTrigger className="absolute bottom-[50%] left-0 top-[50%] z-50 h-fit rounded-lg bg-gray-200 px-4 py-8 transition-all hover:bg-gray-300 hover:text-blue-500">
									<FaChartPie size={20} />
								</SheetTrigger>
							) : (
								""
							)}
							<SheetContent side={"left"}>
								<SheetHeader>
									<SheetTitle
										dir="rtl"
										className="mt-4 flex select-none flex-col rounded-xl bg-gray-100 p-4 text-right font-normal"
									>
										{searchAttribute?.filterByLabel?.title && (
											<span>
												برچسب:
												<span className="mr-1 font-light">
													{searchAttribute?.filterByLabel?.title}
												</span>
											</span>
										)}
										{searchAttribute?.filterByStatus?.name && (
											<span>
												ستون:
												<span className="mr-1 font-light">
													{searchAttribute?.filterByStatus?.name}
												</span>
											</span>
										)}
										<span>
											بر اساس:
											<span className="mr-1 font-light">
												{searchAttribute?.filterByUser
													? "تسک های من"
													: "همه تسک ها"}
											</span>
										</span>
									</SheetTitle>
									<SheetDescription className="overflow-y-auto]">
										<FullOption
											data={[
												{
													value: countTasksWithProgress100(),
													key: 1,
													color: "#22C461",
													title: "تکمیل شده",
												},
												{
													value: countTasksWithProgress0(),
													key: 2,
													color: "#F9BE25",
													title: "در حال اجرا",
												},
											]}
										/>
										<FullOption
											data={[
												{
													value: countTasksWithOverdueDate(),
													key: 1,
													color: "#3B83F5",
													title: "معتبر",
												},
												{
													value: countTasksWithExpiredDate(),
													key: 2,
													color: "#E34A4E",
													title: "منقضی شده",
												},
											]}
										/>
										<FullOption data={countTasksStatuses()} />
									</SheetDescription>
								</SheetHeader>
							</SheetContent>
						</Sheet>
					)}
					<TaskPage
						tasks={tasks}
						loading={loading}
						data={data as Project}
						getTasks={getTasks}
						setLoading={setLoading}
						setTasks={setTasks}
					/>
				</Layout.Content>
			</Layout.Root>
		</>
	);
}
