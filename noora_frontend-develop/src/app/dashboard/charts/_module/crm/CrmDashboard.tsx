"use client";

import { useEffect, useState } from "react";

import { getActivityProject } from "@/activities/services/getActivityProject";
import { Spinner } from "@/components/ui/spinner";
import { Project } from "@/projects/models/Project";
import { getProjectStatuses } from "@/projects/utils/getProjectStatuses";

import { ActivityTypesCountCard } from "./stats/ActivityTypesCountCard";
import { CurrentMonthNewCustomersCountCard } from "./stats/CurrentMonthNewCustomersCountCard";
import { CustomersGrowthRateCard } from "./stats/CustomersGrowthRateCard";
import { StaticCardThree } from "./stats/StaticCardThree";
import { StaticCardTwo } from "./stats/StaticCardTwo";
import { ActivityCard } from "./tables/ActivityCard";
import { InactiveCustomersCard } from "./tables/InactiveCustomersCard";
import { NewCustomersCard } from "./tables/NewCustomersCard";
import { UnusedCustomersCard } from "./tables/UnusedCustomersCard";

function CrmDashboard() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [project, setProject] = useState<Project>();

	const statuses = getProjectStatuses(project);

	useEffect(() => {
		const fetchProject = async () => {
			try {
				setIsLoading(true);

				const project = await getActivityProject();
				setProject(project ?? undefined);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProject();
	}, []);

	if (isLoading) {
		return <Spinner label="در حال دریافت اطلاعات..." size="sm" />;
	}

	return (
		<div className="grid grid-cols-12 gap-3 2xl:gap-8 3xl:grid-cols-10">
			{project && statuses && (
				<ActivityTypesCountCard project={project} statuses={statuses} />
			)}

			<CurrentMonthNewCustomersCountCard />
			<CustomersGrowthRateCard />
			<StaticCardTwo />
			<StaticCardThree />

			<InactiveCustomersCard />
			<UnusedCustomersCard />
			<NewCustomersCard />

			{project && <ActivityCard project={project} />}
		</div>
	);
}

export { CrmDashboard };
