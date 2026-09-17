import { useCallback, useEffect, useMemo, useState } from "react";

import { getActivityProject } from "@/activities/services/getActivityProject";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Project } from "@/projects/models/Project";
import { ProjectStatus } from "@/projects/models/ProjectStatus";

import { BuyerActivitiesList } from "./BuyerActivitiesList";

function BuyerActivitiesWidget() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [project, setProject] = useState<Project | null>(null);

	const statuses = useMemo<ProjectStatus[] | undefined>(() => {
		if (!project) return;

		if (typeof project.statuses.at(0) !== "object") {
			throw new TypeError("the project statuses isn't an object array.");
		}

		return project.statuses as ProjectStatus[];
	}, [project]);

	const loadData = useCallback(async () => {
		try {
			setIsLoading(true);

			const project = await getActivityProject();

			setProject(project);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	if (isLoading) {
		return <></>;
	}

	if (!project || !statuses) {
		return <></>;
	}

	return (
		<div className="col-span-full xl:col-span-4 xl:row-span-2">
			<TooltipProvider>
				<BuyerActivitiesList project={project} statuses={statuses} />
			</TooltipProvider>
		</div>
	);
}

export { BuyerActivitiesWidget };
