import apiClient from "@/api/client";

export interface UpdateUserPasswordDto {
  password: string;
}

interface UpdateUserPasswordApi {
  password: string;
}

export default async function updateUserPassword(
  id: string,
  details: UpdateUserPasswordDto,
): Promise<void> {
  const data: UpdateUserPasswordApi = {
    ...details,
  };

  const response = await apiClient.put({
    url: `/users/${id}`,
    body: data,
  });
}
