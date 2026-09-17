import apiClient from "@/api/client";

import { Buyer } from "../models/Buyer";
import { BuyerApi } from "../models/BuyerApi";
import { parseBuyer } from "../utils/parseBuyer";

async function getBuyerById(id: string): Promise<Buyer | null> {
  const response = await apiClient.get<BuyerApi>({
    url: `/buyers/${id}`,
  });

  return parseBuyer(response.result);
}

export { getBuyerById };
