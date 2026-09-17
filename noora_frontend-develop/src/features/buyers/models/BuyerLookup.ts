type BuyerLookup = {
  id: string;
  name: string;
  nameEn: string;
};

type BuyerLookupApi = {
  id: string;
  name: string;
  metadata: {
    nameEn: string;
  };
};

export type { BuyerLookup, BuyerLookupApi };
