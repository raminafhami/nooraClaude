import { ProjectTaskReminderMethod } from "@/projects/enums/ProjectTaskReminderMethod";

import apiClient from "../client";

interface postNewTaskProps {
	title: string;
	description?: string;
	status: string;
	assignee: string;
	project: string;
	priority: number;
	deadline: string;
	progress: number;
	labels: Array<string>;
	reminder?: string;
	reminderMethod?: ProjectTaskReminderMethod;
	isConfidential?: boolean;
}

export default async function postNewTask({
	title,
	description,
	status,
	assignee,
	project,
	priority,
	deadline,
	progress,
	labels,
	reminder,
	reminderMethod,
	isConfidential,
}: postNewTaskProps) {
	let response;
	let link = `project-task/`;

	response = await apiClient.post({
		url: link,
		body: {
			title,
			description,
			status,
			assignee,
			project,
			priority,
			deadline,
			progress,
			labels,
			reminder,
			reminderMethod,
			isConfidential,
		},
	});

	return response;
}
