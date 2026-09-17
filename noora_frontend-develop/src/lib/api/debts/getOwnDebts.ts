import apiClient from "../client";
import { GetOwnDebtsResult, OwnDebts } from "./models/debtsModels";

interface OwnDebtsProps {
  page: number;
  size: number;
  populate?: string[];
  filters?: {};
}

export default async function getOwnDebts({
  page,
  size,
  populate,
  filters,
}: OwnDebtsProps): Promise<OwnDebts[] | undefined> {
  let response;
  let link = `users/debts/list?page=${page}&size=${size}${
    populate ? `&populate=${populate.join(" ")}` : ""
  }${filters ? `&filters=${JSON.stringify(filters)}` : ""}`;

  try {
    response = await apiClient.get({
      url: link,
    });

    return response.result.data as OwnDebts[];
  } catch (error) {
    console.error("Error fetching own debts:", error);
    return undefined;
  }
}
