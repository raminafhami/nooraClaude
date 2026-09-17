import apiClient from "../client";

interface GetAllProjectsProps {
	page: number;
	size: number;
}

export default async function GetAllProjects({
	page,
	size,
}: GetAllProjectsProps) {
	let response;
	let link = `project?page=${page}&size=${size}&populate=members labels`;

	response = await apiClient.get({
		url: link,
	});

	return response;
}
