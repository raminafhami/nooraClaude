import apiClient from "@/api/client";

async function deleteDispatcherCategory(id: string): Promise<boolean> {
	await apiClient.delete({ url: `dispatcher-category/${id}` });

	return true;
}

export { deleteDispatcherCategory };
