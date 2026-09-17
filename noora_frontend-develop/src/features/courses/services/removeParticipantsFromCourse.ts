import apiClient from "@/api/client";

type RemoveParticipantsFromCourseApi = {
	mode: "-";
	users: string[];
};

async function removeParticipantsFromCourse(
	id: string,
	users: string[],
): Promise<boolean> {
	const data: RemoveParticipantsFromCourseApi = {
		mode: "-",
		users,
	};

	await apiClient.put({
		url: `education/courses/${id}/participants`,
		body: data,
	});

	return true;
}

export { removeParticipantsFromCourse };
