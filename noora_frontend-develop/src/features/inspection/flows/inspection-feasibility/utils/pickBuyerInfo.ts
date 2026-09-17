import { BuyerApi } from "@/buyers/models/BuyerApi";
import { createPicker } from "@/utils/pick";

const pickBuyerInfo = createPicker<BuyerApi>()([
	"id",
	"name",
	"metadata.nameEn",
]);

export { pickBuyerInfo };
