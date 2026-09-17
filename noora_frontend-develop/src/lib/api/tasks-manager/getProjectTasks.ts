import apiClient from "../client";

interface GetProjectTasksProps {
	page: number;
	size: number;
	id?: string;
	filterByUser?: string;
	filterByStatus?: string;
	filterByLabel?: string;
	filterByProjectName?: string;
}

export default async function GetProjectTasks({
	page,
	size,
	id,
	filterByUser,
	filterByStatus,
	filterByLabel,
	filterByProjectName,
}: GetProjectTasksProps) {
	let response;
	const filter: any = { project: id };
	filterByUser && (filter.assignee = { _id: filterByUser });
	filterByLabel && (filter.labels = { _id: filterByLabel });
	filterByProjectName && (filter.project = { _id: filterByProjectName });
	filterByStatus && (filter.status = filterByStatus);
	let link = `project-task?page=${page}&size=${size}&filters=${JSON.stringify(
		filter,
	)}&populate=labels project createdBy`;

	response = await apiClient.get({
		url: link,
	});

	return response;
}
