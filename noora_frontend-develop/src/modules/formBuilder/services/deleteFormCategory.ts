import apiClient from "@/api/client";

async function deleteFormCategory(id: string): Promise<boolean> {
	await apiClient.delete({
		url: `form-builder/categories/${id}`,
	});

	return true;
}

export { deleteFormCategory };
