"use client";

import { useCallback, useMemo, useState } from "react";
import { FaList } from "react-icons/fa6";

import { ActivityType } from "@/activities/enums/ActivityType";
import { Activity } from "@/activities/models/Activity";
import { getActivities } from "@/activities/services/getActivities";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/projects/models/Project";
import { ProjectStatus } from "@/projects/models/ProjectStatus";
import { Loading } from "@/ui/Loader";

import { useCustomerContext } from "../CustomerContext";
import { CustomerActivityCreateButton } from "./CustomerActivityCreateButton";
import { CustomerActivityItem } from "./CustomerActivityItem";
import { CustomerActivityUpsertDialog } from "./CustomerActivityUpsertDialog";

function CustomerActivitiesList({
	project,
	statuses,
}: {
	project: Project;
	statuses: ProjectStatus[];
}) {
	const { customer } = useCustomerContext();

	const todoStatus = useMemo<ProjectStatus>(() => {
		const todoStatus = statuses.find((x) => x.order === 1);

		if (!todoStatus) {
			throw new Error("project status 'todo' is not found.");
		}

		return todoStatus;
	}, [statuses]);

	const doneStatus = useMemo<ProjectStatus>(() => {
		const doneStatus = statuses.find((x) => x.order === 3);

		if (!doneStatus) {
			throw new Error("project status 'done' is not found.");
		}

		return doneStatus;
	}, [statuses]);

	const loadTodoActivities = useCallback(async () => {
		const activities = await getActivities({
			filters: {
				project: project.id,
				customerId: customer.id,
				status: todoStatus.id,
			},
			populate: ["status", "buyerId"],
			sort: { createdAt: "desc" },
		});

		return [activities, activities.length] as [Activity[], number];
	}, [customer.id, project.id, todoStatus.id]);

	const {
		items: todoActivities,
		isLoading: isTodoActivitiesLoading,
		refetch: refetchTodoActivities,
	} = usePagination<Activity>(loadTodoActivities, 0, Number.MAX_SAFE_INTEGER);

	const loadPastActivities = useCallback(
		async (page: number, pageSize: number) => {
			const activities = await getActivities({
				filters: {
					project: project.id,
					customerId: customer.id,
					status: { $ne: todoStatus.id },
				},
				populate: ["status", "buyerId", "labels"],
				sort: { createdAt: "desc" },
				pagination: { page, pageSize },
			});

			return [activities.items, activities.total] as [Activity[], number];
		},
		[customer.id, project.id, todoStatus.id],
	);

	const {
		items: pastActivities,
		isLoading: isPastActivitiesLoading,
		refetch: refetchPastActivities,
		pageSize: pastActivitiesPageSize,
		totalCount: totalPastActivities,
		Pagination: PastActivitiesPagination,
	} = usePagination<Activity>(loadPastActivities, undefined, 3);

	const [inEdit, setInEdit] = useState<Partial<Activity>>();
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const handleDialogOpen = useCallback((activity?: Partial<Activity>) => {
		setInEdit(activity);
		setDialogOpen(true);
	}, []);

	const handleDialogClose = useCallback(
		(activity?: Activity) => {
			setDialogOpen(false);

			if (activity) {
				refetchTodoActivities();
				refetchPastActivities();
			}
		},
		[refetchTodoActivities, refetchPastActivities],
	);

	const handleDialogUnmount = useCallback(() => {
		setInEdit(undefined);
	}, []);

	const handleItemChange = useCallback(() => {
		refetchTodoActivities();
		refetchPastActivities();
	}, [refetchTodoActivities, refetchPastActivities]);

	if (
		isTodoActivitiesLoading ||
		(isPastActivitiesLoading && (!todoActivities || !pastActivities))
	) {
		return <Loading size="sm" />;
	}

	if (!todoActivities || !pastActivities) {
		return <></>;
	}

	return (
		<>
			<Card className="bg-gray-100">
				<CardHeader orientation="horizontal">
					<CardTitle>
						<CardIcon className="bg-white">
							<FaList />
						</CardIcon>
						فعالیت ها
					</CardTitle>
					<CardNav>
						<div className="flex overflow-hidden rounded-xl shadow-md">
							<CustomerActivityCreateButton
								type={ActivityType.Call}
								className="bg-red-500 hover:bg-red-500 active:bg-red-500"
								onPress={handleDialogOpen}
							/>

							<CustomerActivityCreateButton
								type={ActivityType.Meeting}
								className="bg-blue-500 hover:bg-blue-500 active:bg-blue-500"
								onPress={handleDialogOpen}
							/>

							<CustomerActivityCreateButton
								type={ActivityType.Task}
								className="bg-yellow-500 hover:bg-yellow-500 active:bg-yellow-500"
								onPress={handleDialogOpen}
							/>
						</div>
					</CardNav>
				</CardHeader>
				<CardContent className="pb-8">
					{todoActivities.length || pastActivities.length ? (
						<>
							<div className="space-y-6">
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="flex shrink-0 items-center gap-1.5">
											<span>فعالیت های باز</span>
											<span className="text-xs text-muted-foreground">
												({todoActivities?.length ?? 0})
											</span>
										</div>
										<Separator className="h-1 w-auto grow rounded-xl" />
									</div>

									<div className="space-y-6">
										{todoActivities.length !== 0 ? (
											todoActivities.map((activity) => (
												<CustomerActivityItem
													key={activity.id}
													activity={activity}
													project={project}
													doneStatusId={doneStatus.id}
													onChange={handleItemChange}
													onEdit={handleDialogOpen}
												/>
											))
										) : (
											<div className="text-muted-foreground">
												هیچ فعالیت بازی برای مشتری مورد نظر یافت نشد.
											</div>
										)}
									</div>
								</div>

								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<div className="flex shrink-0 items-center gap-1.5">
											<span>فعالیت های بسته شده</span>
											<span className="text-xs text-muted-foreground">
												({pastActivities?.length ?? 0})
											</span>
										</div>
										<Separator className="h-1 w-auto grow rounded-xl" />
									</div>

									<div className="space-y-6">
										{pastActivities.length !== 0 ? (
											<>
												{pastActivities?.map((activity) => (
													<CustomerActivityItem
														key={activity.id}
														activity={activity}
														project={project}
														doneStatusId={doneStatus.id}
														onChange={handleItemChange}
														onEdit={handleDialogOpen}
													/>
												))}

												{totalPastActivities > pastActivitiesPageSize && (
													<PastActivitiesPagination setSize={null} />
												)}
											</>
										) : (
											<div className="text-muted-foreground">
												هیچ فعالیت گذشته ای برای مشتری مورد نظر یافت نشد.
											</div>
										)}
									</div>
								</div>
							</div>
						</>
					) : (
						<div className="text-muted-foreground">
							تاکنون هیچ فعالیتی برای مشتری مورد نظر ثبت نشده است.
						</div>
					)}
				</CardContent>
			</Card>

			<CustomerActivityUpsertDialog
				open={dialogOpen}
				activity={inEdit}
				project={project}
				onClose={handleDialogClose}
				onUnmount={handleDialogUnmount}
			/>
		</>
	);
}

export { CustomerActivitiesList };
