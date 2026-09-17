import apiClient from "@/api/client";

async function deleteIndicator(id: string): Promise<boolean> {
  await apiClient.delete({
    url: `/indicator/${id}`,
  });

  return true;
}

export { deleteIndicator };
