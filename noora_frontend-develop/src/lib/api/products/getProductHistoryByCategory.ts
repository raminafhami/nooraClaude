import apiClient from "../client";

interface GetProductHistoryByCategoryProps {
  categoryName: string;
  branchId: string;
}
export interface DataResult {
  result: { unUsedCodes: number[]; productName: string; productId: string }[];
}

export default async function GetProductHistoryByCategory({
  categoryName,
  branchId,
}: GetProductHistoryByCategoryProps) {
  let response;
  let link = `products/history/list-category/${categoryName}/${branchId}`;

  response = await apiClient.get({
    url: link,
  });

  return (response as DataResult).result;
}
