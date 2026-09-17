import { BuyerLookup, BuyerLookupApi } from "../models/BuyerLookup";

export function parseBuyerLookup(from: BuyerLookupApi): BuyerLookup {
  let result: BuyerLookup = {
    id: from.id,
    name: from.name,
    nameEn: from.metadata.nameEn,
  };

  return result;
}
