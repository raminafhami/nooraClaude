"use client";

import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import {
	FaRegCircleCheck,
	FaRotate,
	FaSquarePollVertical,
} from "react-icons/fa6";
import { toast } from "sonner";

import { ActivityType, activityTypes } from "@/activities/enums/ActivityType";
import { Activity } from "@/activities/models/Activity";
import { getActivities } from "@/activities/services/getActivities";
import { getActivitiesProjectDoneStatus } from "@/activities/utils/getActivitiesProjectDoneStatus";
import { getActivitiesProjectTodoStatus } from "@/activities/utils/getActivitiesProjectTodoStatus";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardTitle,
} from "@/components/ui/card";
import { DateTime } from "@/components/ui/datetime";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Project } from "@/projects/models/Project";
import { ProjectStatus } from "@/projects/models/ProjectStatus";
import { updateProjectTaskStatus } from "@/projects/services/updateProjectTaskStatus";
import { getProjectStatuses } from "@/projects/utils/getProjectStatuses";
import { getObjectKeys } from "@/utils/object/getObjectKeys";

import { CurrentMonthNewCustomersCountCard } from "../../charts/_module/crm/stats/CurrentMonthNewCustomersCountCard";
import { CustomersGrowthRateCard } from "../../charts/_module/crm/stats/CustomersGrowthRateCard";
import { StaticCardThree } from "../../charts/_module/crm/stats/StaticCardThree";
import { StaticCardTwo } from "../../charts/_module/crm/stats/StaticCardTwo";
import { CancelledInstancesTable } from "./CancelledInstancesTable";
import { useContactsContext } from "./ContactsContext";
import { HoldInstancesTable } from "./HoldInstancesTable";

function ContactsDashboard() {
	const { project } = useContactsContext();

	const statuses = getProjectStatuses(project);

	if (!project || !statuses) {
		return;
	}

	const todoStatus = getActivitiesProjectTodoStatus(statuses);
	const doneStatus = getActivitiesProjectDoneStatus(statuses);

	return (
		<div className="grid grid-cols-12 gap-6">
			<DashboardActivitiesOverview project={project} doneStatus={doneStatus} />

			<DashboardActivityTypeList
				className="!col-start-1"
				project={project}
				todoStatus={todoStatus}
				doneStatus={doneStatus}
				type={ActivityType.Call}
				title="تماس هایی که باید بگیرم"
			/>

			<DashboardActivityTypeList
				project={project}
				todoStatus={todoStatus}
				doneStatus={doneStatus}
				type={ActivityType.Meeting}
				title="جلساتی که دارم"
			/>

			<DashboardActivityTypeList
				project={project}
				todoStatus={todoStatus}
				doneStatus={doneStatus}
				type={ActivityType.Task}
				title="کارهایی که باید انجام دهم"
			/>

			<CancelledInstancesTable />

			<HoldInstancesTable />
		</div>
	);
}

function DashboardActivitiesOverview({
	project,
	doneStatus,
}: {
	project: Project;
	doneStatus: ProjectStatus;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [stats, setStats] = useState<Record<ActivityType, number>>({
		call: 0,
		meeting: 0,
		task: 0,
	});

	const queryFn = useCallback(async () => {
		try {
			setIsLoading(true);

			const activities = await getActivities({
				filters: {
					project: project.id,
					status: doneStatus.id,
					deadline: {
						$gte: moment(new Date()).subtract(30, "days").toISOString(),
					},
				},
			});

			const stats = activities.reduce<Record<ActivityType, number>>(
				(acc, curr) => {
					acc[curr.type] += 1;
					return acc;
				},
				{
					call: 0,
					meeting: 0,
					task: 0,
				},
			);
			setStats(stats);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, [doneStatus.id, project.id]);

	useEffect(() => {
		queryFn();
	}, [queryFn]);

	return (
		<div className="col-span-full grid grid-cols-12 gap-6">
			<div className="col-span-12 2xl:col-span-7">
				<Card className="flex h-full flex-col">
					<CardHeader>
						<CardTitle>
							<CardIcon>
								<FaSquarePollVertical />
							</CardIcon>
							آمار ماهیانه فعالیت ها
							<Button
								className={cn(isLoading && "animate-spin")}
								disabled={isLoading}
								size="icon"
								variant="link"
								onClick={() => queryFn()}
							>
								<FaRotate />
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent className="flex h-full flex-col justify-end">
						<div className="grid grid-cols-12 gap-4">
							{getObjectKeys(stats).map((key) => {
								const Icon = activityTypes[key].icon;

								return (
									<div
										key={key}
										className="col-span-full flex justify-center sm:col-span-4"
									>
										<div
											className={cn(
												"flex w-full items-center gap-8 rounded-2xl bg-gradient-to-r px-8 py-6",
												key === ActivityType.Call && "from-red-300 to-red-500",
												key === ActivityType.Meeting &&
													"from-blue-300 to-blue-500",
												key === ActivityType.Task &&
													"from-yellow-300 to-yellow-500",
											)}
										>
											<div className="flex items-center text-white">
												<Icon className="text-2xl" />
											</div>
											<div className="flex flex-col justify-center gap-2">
												<div className="whitespace-nowrap text-base text-white">
													{activityTypes[key].pluralTitle}
												</div>
												<Spinner
													className="me-auto"
													loading={isLoading}
													size="xs"
												>
													<div className="text-sm text-white">
														{stats[key] ? `${stats[key]} مورد` : "-"}
													</div>
												</Spinner>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="col-span-full grid grid-cols-12 gap-6 2xl:col-span-5">
				<div className="col-span-full md:col-span-6 xl:col-span-3 2xl:col-span-6">
					<CurrentMonthNewCustomersCountCard />
				</div>
				<div className="col-span-full md:col-span-6 xl:col-span-3 2xl:col-span-6">
					<CustomersGrowthRateCard />
				</div>
				<div className="col-span-full md:col-span-6 xl:col-span-3 2xl:col-span-6">
					<StaticCardTwo />
				</div>
				<div className="col-span-full md:col-span-6 xl:col-span-3 2xl:col-span-6">
					<StaticCardThree />
				</div>
			</div>
		</div>
	);
}

function DashboardActivityTypeList({
	className,
	project,
	todoStatus,
	doneStatus,
	type,
	title,
}: {
	className?: string;
	project: Project;
	todoStatus: ProjectStatus;
	doneStatus: ProjectStatus;
	type: ActivityType;
	title: string;
}) {
	const { identity } = useLoggedInUser();

	const item = activityTypes[type];

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			const activities = await getActivities({
				filters: {
					project: project.id,
					status: todoStatus.id,
					type,
					assignee: identity.id,
				},
				pagination: { page, pageSize },
				sort: { createdAt: "desc" },
			});

			return [activities.items, activities.total] as const;
		},
		[project.id, todoStatus.id, type, identity.id],
	);

	const { items, isLoading, error, offset, refetch, Pagination } =
		usePagination<Activity>(queryFn);

	const Icon = item.icon;

	const [isPending, setIsPending] = useState<string | boolean>(false);

	const handleDoneClick = useCallback(
		async (activityId: string) => {
			if (isPending) return;

			try {
				setIsPending(activityId);

				await updateProjectTaskStatus(activityId, doneStatus.id);

				refetch();
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام بروزرسانی وضعیت فعالیت رخ داد.");
			} finally {
				setIsPending(false);
			}
		},
		[doneStatus.id, isPending, refetch],
	);

	return (
		<div className={cn("col-span-full lg:col-span-4", className)}>
			<Card className="h-full">
				<CardHeader>
					<CardTitle>
						<CardIcon>
							<Icon />
						</CardIcon>
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent className="px-0">
					<Table
						loading={isLoading}
						pagination={<Pagination size={5} setSize={null} />}
						slotProps={{ root: { className: "rounded-none border-x-0" } }}
					>
						<TableHeader>
							<TableRow>
								<TableHead className="w-1">#</TableHead>
								<TableHead>عنوان</TableHead>
								<TableHead className="w-32">زمان</TableHead>
								<TableHead className="w-1">عملیات</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.length ? (
								items.map((activity, index) => {
									const isDue =
										activity.status === todoStatus.id &&
										new Date(activity.deadline) < new Date();

									return (
										<TableRow key={activity.id}>
											<TableCell>{offset + index + 1}</TableCell>
											<TableCell>{activity.title}</TableCell>
											<TableCell>
												<DateTime
													className={cn("text-xs", isDue && "text-red-600")}
													date={activity.deadline}
												/>
											</TableCell>
											<TableCell>
												<TableActions>
													<TooltipProvider>
														<TableAction>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Button
																		className="h-8 w-full flex-1 rounded-e-none border-e border-gray-100 xs:min-w-11"
																		disabled={!!isPending}
																		size="icon"
																		variant="ghost"
																		onClick={() => handleDoneClick(activity.id)}
																	>
																		<Spinner
																			loading={isPending === activity.id}
																			size="xs"
																		>
																			<FaRegCircleCheck />
																		</Spinner>
																	</Button>
																</TooltipTrigger>
																<TooltipContent>
																	علامت زدن به عنوان انجام شده
																</TooltipContent>
															</Tooltip>
														</TableAction>
													</TooltipProvider>
												</TableActions>
											</TableCell>
										</TableRow>
									);
								})
							) : (
								<TableRow>
									<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

export { ContactsDashboard };
