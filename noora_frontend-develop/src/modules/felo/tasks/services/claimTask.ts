import apiClient from "@/api/client";

async function claimTask(id: string): Promise<boolean> {
  await apiClient.post({
    url: `tasks/${id}/claim`,
  });

  return true;
}

export { claimTask };
