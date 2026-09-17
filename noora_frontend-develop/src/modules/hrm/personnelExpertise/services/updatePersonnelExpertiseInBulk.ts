import apiClient from "@/api/client";

export async function updatePersonnelExpertiseInBulk(
  _id: any,
  status?: string,
  data?: any,
): Promise<any> {
  const response = await apiClient.put({
    url: `/personnel-expertise/bulk`,
    body: {
      _id,
      status,
      data,
    },
  });

  return response;
}
