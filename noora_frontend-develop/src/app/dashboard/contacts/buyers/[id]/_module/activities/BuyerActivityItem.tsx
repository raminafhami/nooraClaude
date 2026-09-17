"use client";

import { useCallback, useState } from "react";
import {
	FaCalendar,
	FaPencil,
	FaRegCircleCheck,
	FaUser,
} from "react-icons/fa6";
import { toast } from "sonner";

import { activityTypes } from "@/activities/enums/ActivityType";
import { Activity } from "@/activities/models/Activity";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserApi } from "@/identity/users/models/User";
import { cn } from "@/lib/utils";
import { Project } from "@/projects/models/Project";
import { ProjectStatus } from "@/projects/models/ProjectStatus";
import { updateProjectTaskStatus } from "@/projects/services/updateProjectTaskStatus";
import { Loading } from "@/ui/Loader";
import { formatString } from "@/utils/string/formatString";

function BuyerActivityItem({
	activity,
	project,
	doneStatusId,
	onChange,
	onEdit,
}: {
	activity: Activity;
	project: Project;
	doneStatusId: string;
	onChange: () => void;
	onEdit: (activity: Activity) => void;
}) {
	const { identity } = useLoggedInUser();

	const [isUpdating, setIsUpdating] = useState<boolean>(false);

	const status =
		typeof activity.status === "object"
			? activity.status
			: typeof project.statuses[0] === "object"
				? (project.statuses as ProjectStatus[]).find(
						(x) => x.id === activity.status,
					)
				: undefined;

	const isDue = new Date(activity.deadline) < new Date();

	const canAction =
		(typeof activity.assignee === "string"
			? activity.assignee === identity.id
			: activity.assignee.id === identity.id) ||
		(typeof activity.createdBy === "string"
			? activity.createdBy === identity.id
			: activity.createdBy.id === identity.id);

	const Icon = activityTypes[activity.type].icon;

	const handleDoneClick = useCallback(async () => {
		if (isUpdating) return;

		try {
			setIsUpdating(true);

			await updateProjectTaskStatus(activity.id, doneStatusId);

			onChange();
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام بروزرسانی وضعیت فعالیت رخ داد.");
		} finally {
			setIsUpdating(false);
		}
	}, [activity.id, doneStatusId, isUpdating, onChange]);

	return (
		<Card className="cursor-default">
			<CardContent className="relative flex flex-col gap-4 py-4 pe-6 ps-8 sm:flex-row">
				<div className="space-y-2">
					<h6 className="leading-6">{activity.description}</h6>

					<div className="space-y-2 text-xs text-muted-foreground">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex max-w-fit items-center gap-2">
									<div className="flex size-5 items-center justify-center rounded-b-lg rounded-t-2xl bg-gray-200">
										<FaUser />
									</div>
									<span>
										{formatString(
											"{0} {1}",
											(activity.assignee as UserApi).name,
											(activity.assignee as UserApi).lastname,
										)}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>مسئول</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex max-w-fit items-center gap-2">
									<div
										className={cn(
											"flex size-5 items-center justify-center rounded-b-lg rounded-t-2xl bg-gray-200",
											isDue && "bg-red-100 text-red-700",
										)}
									>
										<FaCalendar />
									</div>
									<span className={cn(isDue && "text-red-700")}>
										{formatString(
											"{0}، {1}، {2}",
											new Date(activity.deadline).toLocaleDateString(
												"fa-IR-u-nu-latn",
												{
													calendar: "persian",
													weekday: "long",
												},
											),
											new Date(activity.deadline).toLocaleDateString(
												"fa-IR-u-nu-latn",
												{
													calendar: "persian",
													dateStyle: "long",
												},
											),
											new Date(activity.deadline).toLocaleTimeString(
												"fa-IR-u-nu-latn",
												{
													calendar: "persian",
													hour: "2-digit",
													minute: "2-digit",
												},
											),
										)}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>زمان</TooltipContent>
						</Tooltip>
					</div>
				</div>

				<div className="flex flex-col items-start justify-between gap-3 sm:ms-auto sm:items-stretch">
					<div
						className={cn(
							"w-full rounded-lg px-2 py-1 text-center text-xs xs:w-fit sm:w-full",
							(typeof status === "undefined" || status.order === 1) &&
								"bg-gray-100",
							status?.order === 2 && "bg-red-100 text-red-900",
							status?.order === 3 && "bg-green-100 text-green-900",
						)}
					>
						{status?.name ?? "-"}
					</div>

					{canAction && (
						<div className="-mb-7 flex w-full min-w-24 justify-center overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md xs:w-fit">
							{status?.order === 1 && (
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											className="h-8 w-full flex-1 rounded-e-none border-e border-gray-100 xs:min-w-11"
											disabled={isUpdating}
											size="icon"
											variant="ghost"
											onClick={handleDoneClick}
										>
											{isUpdating ? (
												<Loading horizontalPlacement="center" size="xs" />
											) : (
												<FaRegCircleCheck />
											)}
										</Button>
									</TooltipTrigger>
									<TooltipContent>علامت زدن به عنوان انجام شده</TooltipContent>
								</Tooltip>
							)}

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										className="h-8 w-full flex-1 rounded-s-none xs:w-11"
										size="icon"
										variant="ghost"
										onClick={() => onEdit(activity)}
									>
										<FaPencil />
									</Button>
								</TooltipTrigger>
								<TooltipContent>ویرایش</TooltipContent>
							</Tooltip>
						</div>
					)}
				</div>

				<Tooltip>
					<TooltipTrigger asChild>
						<div className="absolute -start-3 top-4 !m-0 flex size-8 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-base text-gray-900 shadow-md">
							<Icon />
						</div>
					</TooltipTrigger>
					<TooltipContent>{activityTypes[activity.type].title}</TooltipContent>
				</Tooltip>
			</CardContent>
		</Card>
	);
}

export { BuyerActivityItem };
