import apiClient from "@/api/client";

export async function getIndicatorCounterByKey(
  key: string,
): Promise<string | null> {
  const response = await apiClient.get<string>({
    url: `/indicator/key/${key}`,
  });

  return response.result;
}
