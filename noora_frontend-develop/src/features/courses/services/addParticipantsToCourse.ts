import apiClient from "@/api/client";

type AddParticipantsToCourseApi = {
	mode: "+";
	users: string[];
};

async function addParticipantsToCourse(
	id: string,
	users: string[],
): Promise<boolean> {
	const data: AddParticipantsToCourseApi = {
		mode: "+",
		users,
	};

	await apiClient.put({
		url: `education/courses/${id}/participants`,
		body: data,
	});

	return true;
}

export { addParticipantsToCourse };
