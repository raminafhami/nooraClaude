import apiClient from "../client";

interface PatchProjectProps {
	name: string;
	members: Array<string>;
	id: string;
	labels?: string[];
}

export default async function PatchProject({
	name,
	labels,
	members,
	id,
}: PatchProjectProps) {
	let response;
	let link = `project/${id}`;

	response = await apiClient.patch({
		url: link,
		body: {
			name,
			members,
			labels,
		},
	});

	return response;
}
