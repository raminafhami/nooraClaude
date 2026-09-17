import apiClient from "../client";

interface GetPeymentCheckProps {
  instanceId: string;
}

export default async function getPeymentCheck({
  instanceId,
}: GetPeymentCheckProps) {
  let response;
  let link = `payment/check/${instanceId}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
