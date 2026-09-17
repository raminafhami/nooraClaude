"use client";

import { useCallback, useId, useState } from "react";

import { ActivityType, activityTypes } from "@/activities/enums/ActivityType";
import { Activity } from "@/activities/models/Activity";
import { ActivityQueryFilter } from "@/activities/models/ActivityQuery";
import { getActivities } from "@/activities/services/getActivities";
import { getActivitiesProjectDoneStatus } from "@/activities/utils/getActivitiesProjectDoneStatus";
import { getActivitiesProjectTodoStatus } from "@/activities/utils/getActivitiesProjectTodoStatus";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DateTime } from "@/components/ui/datetime";
import { usePagination } from "@/components/ui/pagination/usePagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { UserType } from "@/identity/users/models/UserType";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { cn } from "@/lib/utils";
import { Project } from "@/projects/models/Project";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { asScalarProp } from "@/utils/asScalarProp";

type ActivityFilterArgs = Partial<{
	assignee: UserLookup;
	status: string;
}>;

function ActivityCard({ project }: { project: Project }) {
	const [filterArgs, setFilterArgs] = useState<ActivityFilterArgs>({});

	const assigneeId = useId();
	const statusId = useId();

	return (
		<Card className="col-span-full">
			<CardHeader orientation="horizontal">
				<CardTitle>فعالیت ها</CardTitle>
				<CardNav>
					<div className="w-56 space-y-2">
						<label htmlFor={assigneeId}>مسئول:</label>
						<UserLookupSelect
							id={assigneeId}
							type={UserType.Personnel}
							value={filterArgs.assignee ?? null}
							onValueChange={(value) =>
								setFilterArgs({
									...filterArgs,
									assignee: value ?? undefined,
								})
							}
						/>
					</div>

					<div className="w-56 space-y-2">
						<label htmlFor={statusId}>وضعیت:</label>
						<Select
							value={filterArgs.status ?? ""}
							onValueChange={(value) =>
								setFilterArgs({
									...filterArgs,
									status: value !== "clear" ? value : undefined,
								})
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{filterArgs.status && (
									<SelectItem value="clear">همه وضعیت ها</SelectItem>
								)}
								{asNavigationProp(project.statuses).map((status) => (
									<SelectItem key={status.id} value={status.id}>
										{status.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardNav>
			</CardHeader>

			<CardContent>
				<div className="grid grid-cols-12 gap-3 2xl:gap-6">
					<ActivityTypeCard
						key={ActivityType.Task}
						className="!col-start-1"
						project={project}
						type={ActivityType.Task}
						title="کارها"
						filterArgs={filterArgs}
					/>

					<ActivityTypeCard
						key={ActivityType.Call}
						project={project}
						type={ActivityType.Call}
						title="تماس ها"
						filterArgs={filterArgs}
					/>

					<ActivityTypeCard
						key={ActivityType.Meeting}
						project={project}
						type={ActivityType.Meeting}
						title="جلسات"
						filterArgs={filterArgs}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function ActivityTypeCard({
	className,
	project,
	type,
	title,
	filterArgs,
}: {
	className?: string;
	project: Project;
	type: ActivityType;
	title: string;
	filterArgs: ActivityFilterArgs;
}) {
	const item = activityTypes[type];

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			const filters: ActivityQueryFilter = {
				project: project.id,
				type,
			};

			if (filterArgs.assignee) {
				filters.assignee = filterArgs.assignee.id;
			}

			if (filterArgs.status) {
				filters.status = filterArgs.status;
			}

			const activities = await getActivities({
				filters,
				pagination: { page, pageSize },
				populate: ["assignee", "status"],
				sort: { createdAt: "desc" },
			});

			return [activities.items, activities.total] as const;
		},
		[project.id, type, filterArgs],
	);

	const { items, isLoading, error, offset, Pagination } =
		usePagination<Activity>(queryFn);

	const todoStatus = getActivitiesProjectTodoStatus(
		asNavigationProp(project.statuses),
	);

	const doneStatus = getActivitiesProjectDoneStatus(
		asNavigationProp(project.statuses),
	);

	const Icon = item.icon;

	return (
		<div className={cn("col-span-full 2xl:col-span-4", className)}>
			<Card>
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
						pagination={<Pagination size={10} setSize={null} />}
						slotProps={{ root: { className: "rounded-none border-x-0" } }}
					>
						<TableHeader>
							<TableRow className="whitespace-nowrap">
								<TableHead className="w-14">#</TableHead>
								<TableHead>عنوان</TableHead>
								<TableHead className="w-32">مسئول</TableHead>
								<TableHead className="w-32">وضعیت</TableHead>
								<TableHead className="w-32">زمان</TableHead>
								{/* <TableHead className="w-1">عملیات</TableHead> */}
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.length ? (
								items.map((activity, index) => {
									const isDue =
										[todoStatus.id].includes(asScalarProp(activity.status)) &&
										new Date(activity.deadline) < new Date();

									return (
										<TableRow key={activity.id} className="whitespace-nowrap">
											<TableCell>{offset + index + 1}</TableCell>
											<TableCell className="whitespace-normal">
												{activity.title}
											</TableCell>
											<TableCell className="whitespace-normal">
												{getUserFullname(asNavigationProp(activity.assignee))}
											</TableCell>
											<TableCell>
												{
													asNavigationProp(project.statuses)?.find(
														(x) => x.id === activity.status,
													)?.name
												}
											</TableCell>
											<TableCell>
												<DateTime
													className={cn("text-xs", isDue && "text-red-600")}
													date={activity.deadline}
												/>
											</TableCell>
											{/* <TableCell>
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
											</TableCell> */}
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

export { ActivityCard };
