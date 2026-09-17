import apiClient from "@/api/client";

export async function updateExtraRequest(
  requestId: string,
  details: { description: string },
) {
  const response = await apiClient.put({
    url: `/personnel-request/${requestId}`,
    body: details,
  });

  return response.success;
}
