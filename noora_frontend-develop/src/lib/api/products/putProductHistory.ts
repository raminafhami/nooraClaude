import apiClient from "../client";

export interface PutProductsHistoryProps {
  historyItems: HistoryItem[];
}

export interface HistoryItem {
  usedCodes: number[];
  productId: string; // Corrected the property name to match the interface
}

export default async function PutProductsHistory({
  historyItems,
}: PutProductsHistoryProps) {
  let response;
  let link = `products/history/products/`;

  response = await apiClient.put({
    url: link,
    body: { historyItems },
  });

  return response;
}
