type GoodsItem = {
  id: string;
  qty: string;
  packingOrUnit: string;
  netWeight: string;
  grossWeight: string;
  description: string;
  customTariffNoOrHsCode: string;
  document: string;
};

type Goods = GoodsItem[];

export type { GoodsItem, Goods };
