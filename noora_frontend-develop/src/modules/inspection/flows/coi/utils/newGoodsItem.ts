import { v4 as uuidv4 } from "uuid";

import { GoodsItem } from "../models/Goods";

function newGoodsItem({
	customsTariffNo,
}: {
	customsTariffNo?: string;
} = {}): GoodsItem {
	return {
		id: uuidv4(),
		qty: "",
		packingOrUnit: "",
		netWeight: "",
		grossWeight: "",
		description: "",
		customTariffNoOrHsCode: customsTariffNo ?? "",
		document: "",
	};
}

export { newGoodsItem };
