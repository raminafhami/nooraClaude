import apiClient from "../client";

interface GetProductHistoryByIdProps {
  page: number;
  size: number;
  productId?: string;
  branchId?: string | null;
}

export default async function GetProductHistoryList({
  page,
  size,
  productId,
  branchId,
}: GetProductHistoryByIdProps) {
  let response;
  let link = `products/history/list?page=${page}&size=${size}${
    productId ? `&filters={"productId":"${productId}"}` : ""
  } ${branchId ? `&filters={"branchId":{"_id":"${branchId}"}}` : ""}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
