import apiClient from "@/api/client";

interface GetCustomerCheckModel {
  nationalCode: string;
}

export default async function getCustomerCheck(
  details: GetCustomerCheckModel,
): Promise<string> {
  const response = await apiClient.get<string>({
    url: `/financial/customer/${details.nationalCode}/check`,
  });

  return response.result;
}
