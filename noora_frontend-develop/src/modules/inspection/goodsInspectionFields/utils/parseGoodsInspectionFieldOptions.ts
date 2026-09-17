import { GoodsInspectionField } from "../models/GoodsInspectionField";

function parseGoodsInspectionFieldOptions(items: GoodsInspectionField[]) {
  return items.map((item) => ({ label: item.title, value: item.id }));
}

export default parseGoodsInspectionFieldOptions;
