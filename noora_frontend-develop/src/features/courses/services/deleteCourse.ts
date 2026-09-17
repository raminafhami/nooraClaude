import apiClient from "@/api/client";

async function deleteCourse(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `education/courses/${id}`,
	});

	return true;
}

export { deleteCourse };
