"use client";

import moment from "jalali-moment";
import { useCallback, useEffect, useState } from "react";

import { ActivityType, activityTypes } from "@/activities/enums/ActivityType";
import { getActivities } from "@/activities/services/getActivities";
import { getActivitiesProjectDoneStatus } from "@/activities/utils/getActivitiesProjectDoneStatus";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Project } from "@/projects/models/Project";
import { ProjectStatus } from "@/projects/models/ProjectStatus";
import { getJalaliMonthsAndYears } from "@/utils/date/getJalaliMonthsAndYears";
import { getObjectKeys } from "@/utils/object/getObjectKeys";
import { ObjectType } from "@/utils/object/ObjectType";

import { DataCard } from "../../shared/DataCard";

const jalaliMonthsAndYears = getJalaliMonthsAndYears();

function ActivityTypesCountCard({
	project,
	statuses,
}: {
	project: Project;
	statuses: ProjectStatus[];
}) {
	const [dateIndex, setDateIndex] = useState<number>(0);

	const doneStatus = getActivitiesProjectDoneStatus(statuses);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [stats, setStats] = useState<ObjectType<ActivityType, number>>({
		call: 0,
		meeting: 0,
		task: 0,
	});

	const queryFn = useCallback(async () => {
		try {
			setIsLoading(true);

			const monthAndYear = jalaliMonthsAndYears[dateIndex];
			const firstDayOfMonth = moment(
				`${monthAndYear.jalaliYear}-${monthAndYear.jalaliMonth}`,
				"jYYYY-jMM",
			).startOf("jMonth");
			const lastDayOfMonth = moment(
				`${monthAndYear.jalaliYear}-${monthAndYear.jalaliMonth}`,
				"jYYYY-jMM",
			).endOf("jMonth");

			const activities = await getActivities({
				filters: {
					project: project.id,
					status: doneStatus.id,
					deadline: {
						$gte: firstDayOfMonth.toISOString(),
						$lte: lastDayOfMonth.utc().endOf("day").toISOString(),
					},
				},
			});

			const stats = activities.reduce<ObjectType<ActivityType, number>>(
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
	}, [dateIndex, doneStatus.id, project.id]);

	useEffect(() => {
		queryFn();
	}, [queryFn]);

	return (
		<div className="col-span-full row-span-2 2xl:col-span-6">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>آمار ماهیانه فعالیت ها</CardTitle>
					<CardNav>
						<div className="flex items-center gap-3">
							<label className="shrink-0">ماه:</label>
							<Select
								value={dateIndex.toString()}
								onValueChange={(value) => setDateIndex(Number(value))}
							>
								<SelectTrigger className="min-w-36">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{jalaliMonthsAndYears.map((x, index) => (
										<SelectItem key={index} value={index.toString()}>
											{`${x.jalaliMonthName} ${x.jalaliYear}`}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardNav>
				</CardHeader>
				<CardContent className="mt-4">
					<div className="flex flex-1 flex-col gap-4 md:flex-row">
						{getObjectKeys(stats).map((key) => {
							const Icon = activityTypes[key].icon;

							return (
								<DataCard
									key={key}
									className="w-full cursor-default"
									color={
										key === ActivityType.Call
											? "cyan"
											: key === ActivityType.Meeting
												? "red"
												: "purple"
									}
									bgColor={
										key === ActivityType.Call
											? "cyan"
											: key === ActivityType.Meeting
												? "red"
												: "purple"
									}
									icon={Icon}
									title={activityTypes[key].pluralTitle}
									value={stats[key] ? `${stats[key]} مورد` : "-"}
									loading={isLoading}
								/>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export { ActivityTypesCountCard };
