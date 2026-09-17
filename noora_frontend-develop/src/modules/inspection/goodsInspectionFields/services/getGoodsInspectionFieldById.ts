import { GoodsInspectionField } from "../models/GoodsInspectionField";
import getGoodsInspectionFields from "./getGoodsInspectionFields";

function getGoodsInspectionFieldById(id: string): GoodsInspectionField | null {
  return getGoodsInspectionFields().find((x) => x.id === id) ?? null;
}

export default getGoodsInspectionFieldById;
