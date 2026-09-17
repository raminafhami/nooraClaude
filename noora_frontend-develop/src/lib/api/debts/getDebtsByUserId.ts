import apiClient from "../client";
import { GetOwnDebtsResult, OwnDebts, Result } from "./models/debtsModels";

interface OwnDebtsProps {
  page: number;
  size: number;
  userId: string;
  populate?: string[];
  filters?: {};
}

export default async function getDebtsByUserId({
  page,
  size,
  populate,
  filters,
  userId,
}: OwnDebtsProps): Promise<Result | undefined> {
  let response;
  let link = `users/${userId}/debts/list?page=${page}&size=${size}${
    populate ? `&populate=${populate.join(" ")}` : ""
  }${filters ? `&filters=${JSON.stringify(filters)}` : ""}`;

  try {
    response = await apiClient.get<Result>({
      url: link,
    });

    return response.result;
  } catch (error) {
    console.error("Error fetching own debts:", error);
    return undefined;
  }
}
