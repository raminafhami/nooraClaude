import apiClient from "../client";

interface PutProductsQuantityProps {
  startIndex: number;
  endIndex: number;
  id: string;
}

export default async function PutProductsQuantity({
  startIndex,
  endIndex,
  id,
}: PutProductsQuantityProps) {
  let response;
  let link = `products/${id}/add-stock`;

  response = await apiClient.put({
    url: link,
    body: {
      startIndex,
      endIndex,
    },
  });

  return response;
}
