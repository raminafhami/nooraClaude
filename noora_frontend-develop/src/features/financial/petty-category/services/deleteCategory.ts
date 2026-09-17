import apiClient from "@/api/client";

async function deleteCategory(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `category/${id}`,
	});

	return true;
}

export { deleteCategory };
