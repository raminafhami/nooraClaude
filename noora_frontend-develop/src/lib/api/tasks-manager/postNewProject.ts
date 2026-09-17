import apiClient from "../client";

interface PostNewProjectProps {
	name: string;
	labels?: string[];
	statuses: Array<StatusesProps>;
	members: Array<string>;
}

interface StatusesProps {
	name: string;
	order: number;
}
export default async function PostNewProject({
	name,
	labels,
	statuses,
	members,
}: PostNewProjectProps) {
	let response;
	let link = `project/`;

	response = await apiClient.post({
		url: link,
		body: {
			name,
			statuses,
			members,
			labels,
		},
	});

	return response;
}
