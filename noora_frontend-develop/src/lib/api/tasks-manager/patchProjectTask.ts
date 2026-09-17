import apiClient from "../client";

export interface PatchProjectTaskProps {
	title?: string;
	status?: string;
	description?: string;
	id?: string;
	assignee?: any;
	labels?: Array<string>;
	priority?: number;
	deadline?: any;
	order?: number;
	progress?: number;
	isConfidential?: boolean;
}
interface statusProps {
	title: string;
	order: number;
}
export default async function PatchProjectTask({
	title,
	order,
	status,
	description,
	id,
	assignee,
	labels,
	priority,
	deadline,
	progress,
	isConfidential,
}: PatchProjectTaskProps) {
	let response;
	let link = `project-task/${id}`;

	response = await apiClient.patch({
		url: link,
		body: {
			title,
			order,
			status,
			description,
			assignee,
			labels,
			priority,
			deadline,
			progress,
			isConfidential,
		},
	});

	return response;
}
