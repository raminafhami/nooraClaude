import apiClient from "@/api/client";

import { Buyer } from "../models/Buyer";
import { BuyerApi } from "../models/BuyerApi";
import { parseBuyer } from "../utils/parseBuyer";
import { getBuyerById } from "./getBuyerById";

interface BuyerAddToBranchModel {
  branchId: string;
}

interface BuyerAddToBranchReturn extends Buyer {}

interface BuyerAddToBranchApiModel {
  branches: string[];
}

interface BuyerAddToBranchApiReturn extends BuyerApi {}

async function addBuyerToBranch(
  id: string,
  details: BuyerAddToBranchModel,
): Promise<BuyerAddToBranchReturn> {
  const buyer = await getBuyerById(id);

  if (!buyer) {
    throw new Error("buyer not found.");
  }

  const data: BuyerAddToBranchApiModel = {
    branches: [...buyer.branchIds, details.branchId],
  };

  const response = await apiClient.put<BuyerAddToBranchApiReturn>({
    url: `/buyers/${id}`,
    body: data,
  });

  return parseBuyer(response.result);
}

export { addBuyerToBranch };
