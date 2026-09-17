import apiClient from "@/api/client";
import { EntityPageResult } from "@/api/models/EntityPageResult";

import { Buyer } from "../models/Buyer";
import { BuyerApi } from "../models/BuyerApi";
import {
  BuyerBaseQuery,
  BuyerPageQuery,
  BuyerQuery,
} from "../models/BuyerQuery";
import { parseBuyer } from "../utils/parseBuyer";

async function getBuyers(options?: BuyerBaseQuery): Promise<Buyer[]>;

async function getBuyers(
  options: BuyerPageQuery,
): Promise<EntityPageResult<Buyer>>;

async function getBuyers(
  options: BuyerQuery = {},
): Promise<Buyer[] | EntityPageResult<Buyer>> {
  const response = await apiClient.query<BuyerApi>({
    url: "buyers",
    queryOptions: options,
  });

  if (!options.pagination) {
    return parseBuyer(response.result.data);
  }

  return {
    items: parseBuyer(response.result.data),
    page: options.pagination.page,
    pageSize: options.pagination.pageSize,
    total: response.result.count,
  };
}

export { getBuyers };
