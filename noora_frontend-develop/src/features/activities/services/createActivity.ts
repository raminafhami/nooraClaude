import apiClient from "@/api/client";
import { ProjectTaskReminderMethod } from "@/projects/enums/ProjectTaskReminderMethod";

import { ActivityType } from "../enums/ActivityType";
import { Activity } from "../models/Activity";

type CreateActivityDto = {
	type: ActivityType;
	title: string;
	description: string;
	status: string;
	assignee?: string;
	deadline: Date;
	buyerId?: string | null;
	customerId?: string;
	labels?: string[];
	reminder?: Date;
	reminderMethod?: ProjectTaskReminderMethod;
};

type CreateActivityApi = {
	type: ActivityType;
	title: string;
	description?: string;
	status: string;
	assignee?: string;
	deadline: string;
	buyerId?: string;
	customerId?: string;
	labels: string[];
	reminder?: string;
	reminderMethod?: ProjectTaskReminderMethod;
};

async function createActivity(details: CreateActivityDto): Promise<Activity> {
	const data: CreateActivityApi = {
		...details,
		description: details.description.trim() || undefined,
		buyerId: details.buyerId || undefined,
		labels: details.labels ?? [],
		deadline: details.deadline.toISOString(),
		reminder: details.reminder?.toISOString(),
	};

	const response = await apiClient.post<Activity>({
		url: "project-task/activity",
		body: data,
	});

	return response.result;
}

export { createActivity };
