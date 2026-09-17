import apiClient from "@/api/client";
import { ProjectTaskReminderMethod } from "@/projects/enums/ProjectTaskReminderMethod";

import { ActivityType } from "../enums/ActivityType";
import { Activity } from "../models/Activity";

type UpdateActivityDto = {
	type: ActivityType;
	title: string;
	description: string;
	status: string;
	assignee?: string;
	deadline: Date;
	labels?: string[];
	reminder: Date | null;
	reminderMethod: ProjectTaskReminderMethod | null;
};

async function updateActivity(
	id: string,
	details: UpdateActivityDto,
): Promise<Activity> {
	const response = await apiClient.patch<Activity>({
		url: `project-task/${id}/update/activity`,
		body: {
			...details,
			deadline: details.deadline.toISOString(),
			reminder: details.reminder?.toISOString() ?? null,
		},
	});

	return response.result;
}

export { updateActivity };
