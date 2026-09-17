import apiClient from "@/api/client";

interface InstanceFileDeleteModel {
  id: string;
}

export async function deleteInstanceFile(
  details: InstanceFileDeleteModel,
): Promise<void> {
  const response = await apiClient.delete({
    url: `/files/${details.id}`,
  });
}
