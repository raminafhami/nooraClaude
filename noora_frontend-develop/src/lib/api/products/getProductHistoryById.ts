import apiClient from "../client";

interface GetProductHistoryByIdProps {
  historyId: string;
}

export default async function GetProductHistoryById({
  historyId,
}: GetProductHistoryByIdProps) {
  let response;
  let link = `products/history/${historyId}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
