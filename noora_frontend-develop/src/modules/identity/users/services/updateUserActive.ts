import apiClient from "@/api/client";

type UpdateUserActiveApi = {
  isActive: boolean;
};

async function updateUserActive(
  id: string,
  isActive: boolean,
): Promise<boolean> {
  const data: UpdateUserActiveApi = {
    isActive,
  };

  await apiClient.put({
    url: `users/${id}`,
    body: data,
  });

  return true;
}

export { updateUserActive };
